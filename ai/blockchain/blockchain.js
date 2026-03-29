const crypto = require("crypto");
const Block = require("../models/block");

/**
 * Create a new block and save to DB
 */
async function createBlock(data) {
  try {
    const lastBlock = await Block.findOne().sort({ index: -1 });

    const index = lastBlock ? lastBlock.index + 1 : 1;
    const timestamp = new Date().toISOString();
    const previousHash = lastBlock ? lastBlock.hash : "GENESIS";

    // Generate hash
    const hash = crypto
      .createHash("sha256")
      .update(index + timestamp + JSON.stringify(data) + previousHash)
      .digest("hex");

    const newBlock = new Block({
      index,
      timestamp,
      data,
      previousHash,
      hash,
    });

    await newBlock.save();
    return newBlock;
  } catch (error) {
    console.error("BLOCKCHAIN ERROR:", error);
    throw error;
  }
}

/**
 * Get full blockchain from DB
 */
async function getBlockchain() {
  try {
    return await Block.find().sort({ index: 1 });
  } catch (error) {
    console.error("GET BLOCKCHAIN ERROR:", error);
    return [];
  }
}

module.exports = {
  createBlock,
  getBlockchain,
};
