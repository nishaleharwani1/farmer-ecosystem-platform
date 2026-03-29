const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    cropId: { type: mongoose.Schema.Types.ObjectId, ref: "Crop", required: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    totalAmount: { type: Number, required: true },
    amount40: { type: Number, required: true },
    amount60: { type: Number, required: true },
    status: {
        type: String,
        enum: ["placed", "paid40", "shipped", "delivered", "paid100", "completed", "cancelled"],
        default: "placed"
    },
    payment40: { type: Boolean, default: false },
    payment60: { type: Boolean, default: false },
    refundAmount: { type: Number, default: 0 },
    cancellationStage: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", OrderSchema);
