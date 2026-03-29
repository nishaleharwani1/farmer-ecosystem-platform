# 🚀 Agro Innovator - Quick Start Script
# Run this in PowerShell

Write-Host "🌾 Agro Innovator - Starting Services..." -ForegroundColor Green

# Check if MongoDB is running
Write-Host "`n📊 Checking MongoDB..." -ForegroundColor Yellow
$mongoProcess = Get-Process mongod -ErrorAction SilentlyContinue
if ($mongoProcess) {
    Write-Host "✅ MongoDB is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  MongoDB is not running. Starting MongoDB..." -ForegroundColor Red
    Write-Host "   Run: net start MongoDB (requires admin)" -ForegroundColor Yellow
    Write-Host "   Or start mongod manually" -ForegroundColor Yellow
}

Write-Host "`n📦 Checking Node Dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✅ Node modules installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Installing Node dependencies..." -ForegroundColor Red
    npm install
}

Write-Host "`n🐍 Checking Python Dependencies..." -ForegroundColor Yellow
if (Test-Path "ai/requirements.txt") {
    Write-Host "⚠️  Installing Python dependencies..." -ForegroundColor Yellow
    pip install -r ai/requirements.txt
} else {
    Write-Host "✅ Python requirements file exists" -ForegroundColor Green
}

Write-Host "`n✅ Setup Complete!" -ForegroundColor Green
Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Open Terminal 1 and run: cd ai && python ai_service.py" -ForegroundColor White
Write-Host "   2. Open Terminal 2 and run: npm start" -ForegroundColor White
Write-Host "   3. Test API with: node test.js" -ForegroundColor White
Write-Host "`n🌐 Server will be available at: http://localhost:3000" -ForegroundColor Green
Write-Host "🤖 AI Service will be at: http://localhost:5000" -ForegroundColor Green
