# 🌾 Agro Innovator - Complete Agricultural Management System

## 📋 Project Overview
A comprehensive platform connecting farmers, consumers, and validators for transparent agricultural transactions using blockchain technology and AI-powered crop quality analysis.

## 🚀 Features
- **User Authentication**: Register and login for Farmers, Consumers, and Validators
- **AI Crop Analysis**: Automatic crop quality detection using image analysis
- **Wallet System**: Digital wallet for secure transactions
- **Order Management**: Complete order lifecycle with 40-60 payment split
- **Blockchain Integration**: Immutable transaction logging
- **Crop Validation**: Third-party crop quality validation
- **Refund System**: Smart refund calculation based on cancellation stage

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express.js**
- **MongoDB** for database
- **Mongoose** for ODM
- **Multer** for file uploads
- **Axios** for HTTP requests
- **Crypto** for blockchain hashing

### AI Service
- **Python 3.x**
- **Flask** for REST API
- **Flask-CORS** for cross-origin support

## 📁 Project Structure
```
ai/
├── ai/
│   ├── ai_service.py          # AI crop analysis service
│   └── requirements.txt       # Python dependencies
├── blockchain/
│   └── blockchain.js          # Blockchain implementation
├── config/
│   └── db.js                  # Database configuration
├── models/
│   ├── user.js                # User model (farmer/consumer/validator)
│   ├── crop.js                # Crop model with AI report
│   ├── order.js               # Order model
│   └── wallet.js              # Wallet model
├── routes/
│   ├── authroutes.js          # Authentication routes
│   ├── croproutes.js          # Crop management routes
│   ├── orderroutes.js         # Order management routes
│   ├── walletroutes.js        # Wallet routes
│   ├── validatorroutes.js     # Validator routes
│   └── blockchainroutes.js    # Blockchain routes
├── uploads/                   # Uploaded crop images
├── .env                       # Environment variables
├── package.json               # Node.js dependencies
└── server.js                  # Main application server
```

## ⚙️ Installation & Setup

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (running locally or remote)
- **Python 3.x**
- **pip** (Python package manager)

### Step 1: Clone the Repository
```bash
cd "d:\agro innovator project\ai"
```

### Step 2: Install Node.js Dependencies
```bash
npm install
```

### Step 3: Install Python Dependencies
```bash
cd ai
pip install -r requirements.txt
cd ..
```

### Step 4: Setup Environment Variables
The `.env` file is already created with:
```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/agro
AI_SERVICE_URL=http://127.0.0.1:5000/analyze
```

### Step 5: Start MongoDB
Make sure MongoDB is running on `mongodb://127.0.0.1:27017`

### Step 6: Start the AI Service (Terminal 1)
```bash
cd ai
python ai_service.py
```
The AI service will run on `http://127.0.0.1:5000`

### Step 7: Start the Backend Server (Terminal 2)
```bash
npm start
```
The backend server will run on `http://localhost:3000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Crops
- `POST /api/crops/upload` - Upload crop with AI analysis
- `GET /api/crops` - Get all crops
- `GET /api/crops/:id` - Get crop by ID

### Wallet
- `POST /api/wallet/create` - Create wallet for user
- `POST /api/wallet/add` - Add money to wallet
- `POST /api/wallet/debit` - Debit money from wallet
- `GET /api/wallet/:userId` - Get wallet details

### Orders
- `POST /api/orders/place` - Place order
- `POST /api/orders/pay40` - Pay 40% (shipping initiation)
- `POST /api/orders/pay60` - Pay 60% (farmer payout)
- `POST /api/orders/cancel` - Cancel order with refund

### Validator
- `POST /api/validator/approve` - Approve crop
- `POST /api/validator/reject` - Reject crop

### Blockchain
- `GET /api/blockchain` - Get entire blockchain

## 🔄 Workflow

### 1. User Registration
```
Farmer/Consumer/Validator → Register → Create Wallet
```

### 2. Crop Upload (Farmer)
```
Upload Image → AI Analysis → Save to DB → Blockchain Log → Wait for Validation
```

### 3. Crop Validation (Validator)
```
Review Crop → Approve/Reject → Update Status → Blockchain Log
```

### 4. Order Placement (Consumer)
```
Select Crop → Place Order → Pay 40% → Crop Marked as Shipped
```

### 5. Order Completion
```
Receive Crop → Pay 60% → Farmer Gets Paid → Order Completed
```

### 6. Refund Policy
- **Before Validation**: 100% refund
- **After Validation**: 90% refund (10% deduction)
- **After Shipping**: 0% refund

## 🧪 Testing

### Test Server
```bash
curl http://localhost:3000/test
```

### Test Workflow
1. Register 3 users (farmer, consumer, validator)
2. Create wallets for all users
3. Add money to consumer wallet
4. Farmer uploads crop
5. Validator approves crop
6. Consumer places order
7. Consumer pays 40%
8. Consumer pays 60%
9. Check blockchain for all events

## 🔐 Security Notes (Production)
- Currently using plain password storage (hackathon prototype)
- Add **bcrypt** for password hashing
- Implement **JWT** for authentication
- Add **rate limiting**
- Use **helmet** for security headers
- Add input validation and sanitization

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB service
net start MongoDB
```

### AI Service Not Responding
```bash
# Check if Flask is running on port 5000
netstat -ano | findstr :5000

# Restart AI service
cd ai
python ai_service.py
```

### File Upload Issues
- Ensure `uploads/` directory exists
- Check file permissions
- Verify multer configuration

## 📝 All Issues Fixed ✅

### Fixed Issues:
1. ✅ Model import paths corrected (User → user, Wallet → wallet, etc.)
2. ✅ Crop routes complete with multer setup
3. ✅ Order routes added to server
4. ✅ Validator routes added to server
5. ✅ `.env` file created
6. ✅ All route imports fixed
7. ✅ Python requirements.txt added
8. ✅ README documentation created

## 📞 Support
For any issues, check the console logs in both terminals (Node.js and Python).

---
**Happy Farming! 🌾**
