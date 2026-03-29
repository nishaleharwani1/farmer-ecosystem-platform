const mongoose = require('mongoose');
require('dotenv').config();

const checkDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/farmerDB";
        console.log(`Connecting to: ${mongoURI}`);
        await mongoose.connect(mongoURI);
        console.log("✅ MongoDB Connected Successfully");

        const admin = mongoose.connection.db.admin();
        const dbs = await admin.listDatabases();

        console.log("\nDatabases on Server:");
        dbs.databases.forEach(db => console.log(`- ${db.name}`));

        const db = mongoose.connection.db;
        console.log(`\nChecking database: ${db.databaseName}`);
        const collections = await db.listCollections().toArray();

        console.log("Collections:");
        if (collections.length === 0) {
            console.log("No collections found (Database is empty).");
        } else {
            for (let col of collections) {
                const count = await db.collection(col.name).countDocuments();
                console.log(`- ${col.name}: ${count} documents`);

                if (col.name === 'users') {
                    const users = await db.collection('users').find({}, { projection: { email: 1, role: 1, _id: 0 } }).toArray();
                    console.log("  Users found:");
                    users.forEach(u => console.log(`   * ${u.role}: ${u.email}`));
                }
            }
        }

        await mongoose.disconnect();
        console.log("\nDisconnected from MongoDB");
        process.exit(0);
    } catch (error) {
        console.error("❌ MongoDB Check Failed:", error.message);
        process.exit(1);
    }
};

checkDB();
