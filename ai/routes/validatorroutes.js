const express = require("express");
const Crop = require("../models/crop");
const Order = require("../models/order");
const { createBlock } = require("../blockchain/blockchain");

const router = express.Router();

/* ================= APPROVE CROP ================= */
router.post("/approve", async (req, res) => {
  try {
    const { cropId, validatorId } = req.body;

    if (!cropId || !validatorId) {
      return res
        .status(400)
        .json({ message: "cropId and validatorId required" });
    }

    const crop = await Crop.findById(cropId);
    if (!crop) {
      return res.status(404).json({ message: "Crop not found" });
    }

    crop.validatorStatus = "approved";
    // We don't have validatedBy in schema yet, but it's good for 'real' app
    // crop.validatedBy = validatorId; 
    await crop.save();

    // Blockchain log
    await createBlock({
      event: "CROP_APPROVED",
      cropId,
      validatorId,
      timestamp: new Date().toISOString(),
    });

    res.json({ message: "Crop approved by validator", crop });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Crop approval failed" });
  }
});

/* ================= REJECT CROP ================= */
router.post("/reject", async (req, res) => {
  try {
    const { cropId, validatorId, reason } = req.body;

    if (!cropId || !validatorId) {
      return res
        .status(400)
        .json({ message: "cropId and validatorId required" });
    }

    const crop = await Crop.findById(cropId);
    if (!crop) {
      return res.status(404).json({ message: "Crop not found" });
    }

    crop.validatorStatus = "rejected";
    await crop.save();

    // Cancel any related orders if crop is rejected
    await Order.updateMany(
      { cropId, status: { $ne: "completed" } },
      { status: "cancelled" }
    );

    // Blockchain log
    await createBlock({
      event: "CROP_REJECTED",
      cropId,
      validatorId,
      reason: reason || "Quality not acceptable",
      timestamp: new Date().toISOString(),
    });

    res.json({ message: "Crop rejected by validator", crop });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Crop rejection failed" });
  }
});

module.exports = router;
