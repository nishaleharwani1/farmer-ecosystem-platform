const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    balance: { type: Number, default: 0 },
    transactions: [
        {
            amount: Number,
            type: { type: String, enum: ["credit", "debit"] },
            description: String,
            timestamp: { type: Date, default: Date.now }
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Wallet", WalletSchema);
