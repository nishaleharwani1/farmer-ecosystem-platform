const axios = require("axios");

const BASE_URL = "http://localhost:3000";

// Test data
let farmerId, consumerId, validatorId;
let cropId, orderId;

async function testAPI() {
    console.log("🧪 Starting API Tests...\n");

    try {
        // 1. Test Server Health
        console.log("1️⃣ Testing Server Health...");
        const health = await axios.get(`${BASE_URL}/test`);
        console.log("✅ Server is running:", health.data);

        // 2. Register Farmer
        console.log("\n2️⃣ Registering Farmer...");
        const farmer = await axios.post(`${BASE_URL}/api/auth/register`, {
            name: "Test Farmer",
            email: "farmer@test.com",
            password: "farmer123",
            role: "farmer",
        });
        farmerId = farmer.data.user._id;
        console.log("✅ Farmer registered:", farmerId);

        // 3. Register Consumer
        console.log("\n3️⃣ Registering Consumer...");
        const consumer = await axios.post(`${BASE_URL}/api/auth/register`, {
            name: "Test Consumer",
            email: "consumer@test.com",
            password: "consumer123",
            role: "consumer",
        });
        consumerId = consumer.data.user._id;
        console.log("✅ Consumer registered:", consumerId);

        // 4. Register Validator
        console.log("\n4️⃣ Registering Validator...");
        const validator = await axios.post(`${BASE_URL}/api/auth/register`, {
            name: "Test Validator",
            email: "validator@test.com",
            password: "validator123",
            role: "validator",
        });
        validatorId = validator.data.user._id;
        console.log("✅ Validator registered:", validatorId);

        // 5. Login Test
        console.log("\n5️⃣ Testing Login...");
        const login = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: "farmer@test.com",
            password: "farmer123",
        });
        console.log("✅ Login successful:", login.data.user.name);

        // 6. Create Wallets
        console.log("\n6️⃣ Creating Wallets...");
        await axios.post(`${BASE_URL}/api/wallet/create`, { userId: farmerId });
        await axios.post(`${BASE_URL}/api/wallet/create`, { userId: consumerId });
        await axios.post(`${BASE_URL}/api/wallet/create`, { userId: validatorId });
        console.log("✅ Wallets created for all users");

        // 7. Add Money to Consumer Wallet
        console.log("\n7️⃣ Adding Money to Consumer Wallet...");
        const addMoney = await axios.post(`${BASE_URL}/api/wallet/add`, {
            userId: consumerId,
            amount: 10000,
        });
        console.log("✅ Money added. Balance:", addMoney.data.balance);

        // 8. Get Wallet Details
        console.log("\n8️⃣ Getting Consumer Wallet...");
        const wallet = await axios.get(`${BASE_URL}/api/wallet/${consumerId}`);
        console.log("✅ Wallet Balance:", wallet.data.balance);
        console.log("   Transactions:", wallet.data.transactions.length);

        // 9. Get Blockchain
        console.log("\n9️⃣ Getting Blockchain...");
        const blockchain = await axios.get(`${BASE_URL}/api/blockchain`);
        console.log("✅ Blockchain length:", blockchain.data.length);
        console.log("   Blocks:", blockchain.data.chain.length);

        console.log("\n✅ All Basic Tests Passed! 🎉");
        console.log("\n📝 Note: Crop upload test requires AI service running");
        console.log("   Start AI service: cd ai && python ai_service.py");
    } catch (error) {
        console.error("\n❌ Test Failed:");
        if (error.response) {
            console.error("   Status:", error.response.status);
            console.error("   Message:", error.response.data.message || error.response.data);
        } else {
            console.error("   Error:", error.message);
        }
        console.error("\n💡 Make sure:");
        console.error("   1. MongoDB is running");
        console.error("   2. Server is running (npm start)");
        console.error("   3. Port 3000 is available");
    }
}

// Run tests
testAPI();
