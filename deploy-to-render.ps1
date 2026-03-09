# Render Deployment Script
# Run this script to prepare your app for deployment

Write-Host "🚀 Preparing Email Sender App for Render deployment..." -ForegroundColor Green

# Check if Git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "⚠️  Git not initialized. Initializing Git repository..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit for deployment"
} else {
    Write-Host "✅ Git repository found" -ForegroundColor Green
}

# Check for .env files and warn user
if (Test-Path ".env") {
    Write-Host "⚠️  WARNING: .env file found. Make sure it's in .gitignore!" -ForegroundColor Yellow
}

if (Test-Path "backend/.env") {
    Write-Host "⚠️  WARNING: backend/.env file found. Make sure it's in .gitignore!" -ForegroundColor Yellow
}

# Check if dependencies are installed
Write-Host "📦 Checking dependencies..." -ForegroundColor Blue

# Backend dependencies
if (Test-Path "backend/node_modules") {
    Write-Host "✅ Backend dependencies found" -ForegroundColor Green
} else {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
}

# Frontend dependencies
if (Test-Path "frontend/node_modules") {
    Write-Host "✅ Frontend dependencies found" -ForegroundColor Green
} else {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

# Test build
Write-Host "🔧 Testing production build..." -ForegroundColor Blue
Set-Location frontend
$env:VITE_API_URL = "https://email-sender-backend.onrender.com"
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend builds successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "🎉 Your app is ready for deployment!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Create a GitHub repository and push your code" -ForegroundColor White
Write-Host "2. Go to render.com and create a new Web Service for backend" -ForegroundColor White
Write-Host "3. Create a new Static Site for frontend" -ForegroundColor White
Write-Host "4. Follow the detailed guide in RENDER_DEPLOYMENT_GUIDE.md" -ForegroundColor White
Write-Host ""
Write-Host "Important URLs to remember:" -ForegroundColor Yellow
Write-Host "- Backend will be: https://your-backend-name.onrender.com" -ForegroundColor White
Write-Host "- Frontend will be: https://your-frontend-name.onrender.com" -ForegroundColor White
