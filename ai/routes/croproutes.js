const express = require("express");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const Crop = require("../models/crop");
const User = require("../models/user");
const { createBlock } = require("../blockchain/blockchain");

const router = express.Router();

/* ================= MULTER SETUP ================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/* ================= UPLOAD CROP ================= */
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const { farmerId, name, category, quantity, price } = req.body;

    if (!req.file || !farmerId || !name || !quantity || !price) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const farmer = await User.findById(farmerId);
    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    // Prepare image for AI service
    const formData = new FormData();
    formData.append("image", fs.createReadStream(req.file.path));

    // Call AI service
    let aiReport = { quality: "B", pestDetected: false }; // Default fallback
    try {
      const aiResponse = await axios.post(
        process.env.AI_SERVICE_URL || "http://127.0.0.1:5000/analyze",
        formData,
        { headers: formData.getHeaders() }
      );
      aiReport = aiResponse.data;
    } catch (aiErr) {
      console.error("AI Service Error:", aiErr.message);
      // Continue with default quality if AI service is down
    }

    // Save crop in database
    const crop = new Crop({
      farmerId,
      farmerName: farmer.name,
      name,
      category: category || "Other",
      quantity,
      price,
      image: req.file.filename,
      quality: aiReport.quality || "B",
      pestDetected: aiReport.pestDetected || false,
      status: "available",
      validatorStatus: "pending",
    });
    await crop.save();

    // Blockchain log (Persistent & Async)
    await createBlock({
      event: "CROP_UPLOADED",
      cropId: crop._id,
      farmerId,
      farmerName: farmer.name,
      cropName: name,
      quality: crop.quality,
      timestamp: new Date().toISOString()
    });

    return res.json({
      message: "Crop uploaded & AI checked",
      crop,
      aiReport,
      imageUrl: `/uploads/${req.file.filename}`,
    });
  } catch (err) {
    console.error("UPLOAD ERROR =>", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

/* ================= GET ALL CROPS ================= */
router.get("/", async (req, res) => {
  try {
    const crops = await Crop.find().populate("farmerId", "name email");
    res.json(crops);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch crops" });
  }
});

/* ================= GET CROP BY ID ================= */
router.get("/:id", async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id).populate(
      "farmerId",
      "name email"
    );
    if (!crop) {
      return res.status(404).json({ message: "Crop not found" });
    }
    res.json(crop);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch crop" });
  }
});

module.exports = router;
