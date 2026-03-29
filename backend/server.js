const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database'); // Initialize DB

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend HTML files
app.use(express.static(path.join(__dirname, '../hackathon/hackathon')));

// Health Check API
app.get('/api/health', (req, res) => {
    res.json({ message: 'Agro Innovator Backend is running successfully!' });
});

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'supersecretkey123'; // In production, this should be an environment variable

// -------------------------------------------------------------
// Authentication APIs
// -------------------------------------------------------------

// Register API
app.post('/api/auth/register', async (req, res) => {
    const { role, name, email, password } = req.body;
    if (!role || !name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const stmt = db.prepare(`INSERT INTO Users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`);
        
        stmt.run([name, email, hashedPassword, role], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ message: 'Email already exists.' });
                }
                return res.status(500).json({ message: 'Database error.' });
            }
            res.status(201).json({ message: 'User registered successfully!' });
        });
        stmt.finalize();
    } catch (err) {
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// Login API
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    db.get(`SELECT user_id AS _id, name, email, password_hash, role FROM Users WHERE email = ?`, [email], async (err, row) => {
        if (err) return res.status(500).json({ message: 'Database error.' });
        if (!row) return res.status(401).json({ message: 'Invalid email or password.' });

        const isMatch = await bcrypt.compare(password, row.password_hash);
        if (!isMatch) return res.status(401).json({ message: 'Invalid email or password.' });

        const token = jwt.sign({ id: row._id, role: row.role }, JWT_SECRET, { expiresIn: '1d' });
        
        res.json({
            message: 'Login successful',
            token: token,
            user: {
                _id: row._id,
                name: row.name,
                email: row.email,
                role: row.role
            }
        });
    });
});

// Middleware to verify token for protected routes
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// -------------------------------------------------------------
// Crop Management & Wallet APIs
// -------------------------------------------------------------

const multer = require('multer');
const fs = require('fs');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Setup Multer for Image Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// GET Wallet Balance
app.get('/api/wallet/:userId', (req, res) => {
    // Standardizing on 'balance' in the Users table instead of a separate Wallet logic for demo
    db.get('SELECT user_id, name, email FROM Users WHERE user_id = ?', [req.params.userId], (err, row) => {
        if (err || !row) return res.status(404).json({ message: 'User not found' });
        // Simulating wallet balance mapping
        res.json({ balance: 5000.0 }); // Hardcoded demo balance
    });
});

// POST Create Wallet (Dummy to satisfy frontend)
app.post('/api/wallet/create', (req, res) => {
    res.json({ message: 'Wallet created', balance: 5000.0 });
});

// GET All Crops
app.get('/api/crops', (req, res) => {
    db.all(`SELECT c.crop_id AS _id, c.farmer_id AS farmerId, c.name, c.price_per_unit AS price, c.quantity_available AS quantity, 'available' as status, c.validator_status as validatorStatus, 'A' as quality, 'default.jpg' as image, u.name AS farmerName 
            FROM Crops c 
            JOIN Users u ON c.farmer_id = u.user_id`, [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error fetching crops' });
        res.json(rows);
    });
});

// POST Upload Crop
app.post('/api/crops/upload', upload.single('image'), (req, res) => {
    const { farmerId, name, category, quantity, price } = req.body;
    const imagePath = req.file ? req.file.filename : null;

    if (!farmerId || !name || !price || !quantity) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const stmt = db.prepare(`INSERT INTO Crops (farmer_id, name, category, price_per_unit, quantity_available) VALUES (?, ?, ?, ?, ?)`);
    stmt.run([farmerId, name, category, price, quantity], function(err) {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        
        // Return dummy AI report to satisfy frontend
        res.status(201).json({ 
            message: 'Crop uploaded',
            cropId: this.lastID,
            aiReport: { quality_grade: 'A', pest_detected: 'None' }
        });
    });
    stmt.finalize();
});

// POST Place Order
app.post('/api/orders/place', (req, res) => {
    const { cropId, consumerId } = req.body;
    
    // 1. Get the crop details
    db.get('SELECT price_per_unit, quantity_available FROM Crops WHERE crop_id = ? AND validator_status = "approved"', [cropId], (err, crop) => {
        if (err || !crop) return res.status(400).json({ message: 'Crop not found or not verified by Middleman yet.' });
        if (crop.quantity_available <= 0) return res.status(400).json({ message: 'Crop sold out.' });

        const orderQuantity = 1; // Assuming 1 unit purchase for simplicity
        const totalAmount = crop.price_per_unit * orderQuantity;

        // 2. Find a random Middleman (Validator) to act as the delivery agent
        db.get('SELECT user_id FROM Users WHERE role = "validator" ORDER BY RANDOM() LIMIT 1', [], (err, validator) => {
            const validatorId = validator ? validator.user_id : null;

            // 3. Create the Order
            db.run(`INSERT INTO Orders (consumer_id, validator_id, total_amount, status) VALUES (?, ?, ?, 'assigned')`, 
                [consumerId, validatorId, totalAmount], function(err) {
                if (err) return res.status(500).json({ message: 'Error creating order.' });
                
                const orderId = this.lastID;

                // 4. Create Order Item
                db.run(`INSERT INTO OrderItems (order_id, crop_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)`,
                    [orderId, cropId, orderQuantity, crop.price_per_unit], (err) => {
                    
                    // 5. Update Crop Quantity
                    db.run('UPDATE Crops SET quantity_available = quantity_available - ? WHERE crop_id = ?', [orderQuantity, cropId], () => {
                        res.json({ message: 'Order placed & Middleman assigned for delivery!' });
                    });
                });
            });
        });
    });
});

// GET Consumer Orders
app.get('/api/orders/consumer/:consumerId', (req, res) => {
    db.all(`SELECT o.order_id, o.status AS orderStatus, o.total_amount AS totalAmount, c.name AS cropName 
            FROM Orders o
            JOIN OrderItems oi ON o.order_id = oi.order_id
            JOIN Crops c ON oi.crop_id = c.crop_id
            WHERE o.consumer_id = ? ORDER BY o.order_date DESC`, [req.params.consumerId], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error fetching orders' });
        res.json(rows);
    });
});

// POST Validator Actions (Approve/Reject)
app.post('/api/validator/:action', (req, res) => {
    const { action } = req.params; // 'approve' or 'reject'
    const { cropId, validatorId } = req.body;
    
    if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ message: 'Invalid action' });
    }

    const status = action === 'approve' ? 'approved' : 'rejected';

    const stmt = db.prepare(`UPDATE Crops SET validator_status = ? WHERE crop_id = ?`);
    stmt.run([status, cropId], function(err) {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (this.changes === 0) return res.status(404).json({ message: 'Crop not found' });
        res.json({ message: 'Crop ' + status + ' successfully' });
    });
    stmt.finalize();
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log('Server is running on http://localhost:' + PORT);
    });
}

module.exports = app;
