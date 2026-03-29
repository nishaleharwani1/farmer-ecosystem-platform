const mongoose = require("mongoose");

const CropSchema = new mongoose.Schema({
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    farmerName: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String },
    quality: { type: String, default: "Pending" }, // A, B, C, D
    pestDetected: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ["available", "locked", "sold"],
        default: "available"
    },
    validatorStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Crop", CropSchema);
