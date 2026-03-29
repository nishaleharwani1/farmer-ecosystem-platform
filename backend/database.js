const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'agro_innovator.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Enabling foreign keys
        db.run('PRAGMA foreign_keys = ON;');

        // Initialize Tables
        db.serialize(() => {
            // Users Table
            db.run(`CREATE TABLE IF NOT EXISTS Users (
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT CHECK(role IN ('farmer', 'consumer', 'validator')) NOT NULL,
                phone TEXT,
                address TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Crops Table
            db.run(`CREATE TABLE IF NOT EXISTS Crops (
                crop_id INTEGER PRIMARY KEY AUTOINCREMENT,
                farmer_id INTEGER,
                name TEXT NOT NULL,
                category TEXT,
                description TEXT,
                price_per_unit REAL NOT NULL,
                quantity_available REAL NOT NULL,
                unit TEXT,
                validator_status TEXT CHECK(validator_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
                listed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (farmer_id) REFERENCES Users(user_id)
            )`);

            // Orders Table
            db.run(`CREATE TABLE IF NOT EXISTS Orders (
                order_id INTEGER PRIMARY KEY AUTOINCREMENT,
                consumer_id INTEGER,
                validator_id INTEGER,
                total_amount REAL NOT NULL,
                status TEXT CHECK(status IN ('pending', 'assigned', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
                order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                delivery_address TEXT,
                FOREIGN KEY (consumer_id) REFERENCES Users(user_id),
                FOREIGN KEY (validator_id) REFERENCES Users(user_id)
            )`);

            // Order Items Table
            db.run(`CREATE TABLE IF NOT EXISTS OrderItems (
                order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER,
                crop_id INTEGER,
                quantity REAL NOT NULL,
                price_at_purchase REAL NOT NULL,
                FOREIGN KEY (order_id) REFERENCES Orders(order_id),
                FOREIGN KEY (crop_id) REFERENCES Crops(crop_id)
            )`);
            
            console.log('Database tables successfully initialized.');
        });
    }
});

module.exports = db;
