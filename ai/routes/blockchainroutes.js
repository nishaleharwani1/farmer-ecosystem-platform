const express = require("express");
const { getBlockchain } = require("../blockchain/blockchain");

const router = express.Router();

/* ================= GET BLOCKCHAIN ================= */
router.get("/", async (req, res) => {
  try {
    const chain = await getBlockchain();
    res.json({
      length: chain.length,
      chain,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch blockchain" });
  }
});

module.exports = router;
