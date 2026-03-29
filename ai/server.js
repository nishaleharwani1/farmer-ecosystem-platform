require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

const app = express();

/* ================= DATABASE ================= */
const connectDB = require("./config/db");
connectDB();



/* ================= MIDDLEWARE (ORDER MAT CHANGE KARNA) ================= */
app.use(cors());
app.use(express.urlencoded({ extended: true })); // 🔥 multer ke liye important
app.use(express.json());

/* ================= STATIC FILES ================= */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ================= ROUTES ================= */
app.use("/api/auth", require("./routes/authroutes"));
app.use("/api/crops", require("./routes/croproutes"));
app.use("/api/wallet", require("./routes/walletroutes"));
app.use("/api/blockchain", require("./routes/blockchainroutes"));
app.use("/api/orders", require("./routes/orderroutes"));
app.use("/api/validator", require("./routes/validatorroutes"));

/* ================= TEST ROUTE ================= */
app.get("/test", (req, res) => {
  res.json({ message: "Server is working ✅" });
});

/* ================= DEFAULT ROUTE ================= */
app.get("/", (req, res) => {
  res.send("API is running successfully 🚀");
});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
