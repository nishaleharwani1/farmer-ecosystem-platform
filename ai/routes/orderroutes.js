const express = require("express");
const Order = require("../models/order");
const Wallet = require("../models/wallet");
const Crop = require("../models/crop");
const { createBlock } = require("../blockchain/blockchain");

const router = express.Router();

/* ================= PLACE ORDER ================= */
router.post("/place", async (req, res) => {
  try {
    const { cropId, consumerId } = req.body;

    const crop = await Crop.findById(cropId);
    if (!crop || crop.status !== "available") {
      return res.status(400).json({ message: "Crop not available" });
    }

    const totalAmount = crop.price * crop.quantity;

    const order = new Order({
      cropId,
      buyerId: consumerId,
      farmerId: crop.farmerId,
      totalAmount,
      amount40: totalAmount * 0.4,
      amount60: totalAmount * 0.6,
      status: "placed",
    });

    crop.status = "locked";
    await crop.save();
    await order.save();

    await createBlock({
      event: "ORDER_PLACED",
      orderId: order._id,
      cropId,
      consumerId,
      amount: totalAmount
    });

    res.json({ message: "Order placed successfully", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Order placement failed" });
  }
});

/* ================= PAY 40% ================= */
router.post("/pay40", async (req, res) => {
  try {
    const { orderId, consumerId } = req.body;

    const order = await Order.findById(orderId);
    if (!order || order.status !== "placed") {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const consumerWallet = await Wallet.findOne({ userId: consumerId });
    if (!consumerWallet || consumerWallet.balance < order.amount40) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct from consumer
    consumerWallet.balance -= order.amount40;
    consumerWallet.transactions.push({
      type: "debit",
      amount: order.amount40,
      description: `40% payment for order ${orderId}`,
    });
    await consumerWallet.save();

    order.payment40 = true;
    order.status = "paid40"; // In real usage, maybe 'shipped' comes next after internal check
    await order.save();

    await createBlock({
      event: "PAYMENT_40_PERCENT",
      orderId,
      amount: order.amount40,
      buyerId: consumerId
    });

    res.json({ message: "40% payment successful", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "40% payment failed" });
  }
});

/* ================= PAY 60% (FARMER PAYOUT) ================= */
router.post("/pay60", async (req, res) => {
  try {
    const { orderId, consumerId } = req.body;

    const order = await Order.findById(orderId);
    // Assuming status transitions to something like 'delivered' or 'paid40' before 'completed'
    if (!order || order.payment40 === false) {
      return res.status(400).json({ message: "40% payment must be done first" });
    }

    const consumerWallet = await Wallet.findOne({ userId: consumerId });
    if (!consumerWallet || consumerWallet.balance < order.amount60) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct from consumer
    consumerWallet.balance -= order.amount60;
    consumerWallet.transactions.push({
      type: "debit",
      amount: order.amount60,
      description: `60% payment for order ${orderId}`,
    });
    await consumerWallet.save();

    // Pay farmer
    const farmerWallet = await Wallet.findOne({ userId: order.farmerId });
    if (farmerWallet) {
      farmerWallet.balance += (order.amount40 + order.amount60); // Total payout
      farmerWallet.transactions.push({
        type: "credit",
        amount: order.totalAmount,
        description: `Full payment received for order ${orderId}`,
      });
      await farmerWallet.save();
    }

    order.payment60 = true;
    order.status = "completed";
    await order.save();

    // Mark crop as sold
    await Crop.findByIdAndUpdate(order.cropId, { status: "sold" });

    await createBlock({
      event: "ORDER_COMPLETED",
      orderId,
      farmerId: order.farmerId,
      amount: order.totalAmount,
    });

    res.json({ message: "Order completed & farmer paid successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "60% payment failed" });
  }
});

/* ================= CANCEL ORDER ================= */
router.post("/cancel", async (req, res) => {
  try {
    const { orderId, consumerId } = req.body;

    const order = await Order.findById(orderId);
    const wallet = await Wallet.findOne({ userId: consumerId });

    if (!order || !wallet) {
      return res.status(404).json({ message: "Order or wallet not found" });
    }

    if (order.status === "completed" || order.status === "cancelled") {
      return res.status(400).json({ message: "Order cannot be cancelled" });
    }

    let refundAmount = 0;

    if (!order.payment40) {
      refundAmount = 0;
      order.cancellationStage = "BEFORE_PAYMENT";
    } else {
      // If 40% was paid, refund 90% of it as penalty
      refundAmount = order.amount40 * 0.9;
      order.cancellationStage = "AFTER_PARTIAL_PAYMENT";
    }

    if (refundAmount > 0) {
      wallet.balance += refundAmount;
      wallet.transactions.push({
        type: "credit",
        amount: refundAmount,
        description: `Refund for cancelled order ${orderId}`,
      });
      await wallet.save();
    }

    order.status = "cancelled";
    order.refundAmount = refundAmount;
    await order.save();

    // Unlock crop
    await Crop.findByIdAndUpdate(order.cropId, { status: "available" });

    await createBlock({
      event: "ORDER_CANCELLED",
      orderId,
      refundAmount,
      stage: order.cancellationStage,
    });

    res.json({
      message: "Order cancelled successfully",
      refundAmount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Cancellation failed" });
  }
});

module.exports = router;
