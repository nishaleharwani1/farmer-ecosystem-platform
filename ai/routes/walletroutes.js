const express = require("express");
const Wallet = require("../models/wallet");

const router = express.Router();

/* ================= CREATE WALLET ================= */
router.post("/create", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const existingWallet = await Wallet.findOne({ userId });
    if (existingWallet) {
      return res.status(400).json({ message: "Wallet already exists" });
    }

    const wallet = new Wallet({ userId });
    await wallet.save();

    res.json({ message: "Wallet created successfully", wallet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Wallet creation failed" });
  }
});

/* ================= ADD MONEY ================= */
router.post("/add", async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const amt = Number(amount);

    if (!userId || !amt || amt <= 0) {
      return res.status(400).json({ message: "Invalid userId or amount" });
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    wallet.balance += amt;
    wallet.transactions.push({
      type: "credit",
      amount: amt,
      description: "WALLET_TOPUP",
    });

    await wallet.save();

    res.json({
      message: "Money added successfully",
      balance: wallet.balance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add money" });
  }
});

/* ================= DEBIT MONEY ================= */
router.post("/debit", async (req, res) => {
  try {
    const { userId, amount, reason } = req.body;
    const amt = Number(amount);

    if (!userId || !amt || amt <= 0) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    if (wallet.balance < amt) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    wallet.balance -= amt;
    wallet.transactions.push({
      type: "debit",
      amount: amt,
      description: reason || "PAYMENT",
    });

    await wallet.save();

    res.json({
      message: "Money debited successfully",
      balance: wallet.balance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Debit failed" });
  }
});

/* ================= GET WALLET ================= */
router.get("/:userId", async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.params.userId });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    res.json(wallet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch wallet" });
  }
});

module.exports = router;
