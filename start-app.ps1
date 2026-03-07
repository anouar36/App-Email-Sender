# Email Sender Application - Automated Setup Script
# Run this script to set up and start both backend and frontend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Email Sender - Setup & Start Script  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ROOT_DIR = "C:\Users\Youcode\Desktop\App-Email-Sender"
$BACKEND_DIR = "$ROOT_DIR\backend"
$FRONTEND_DIR = "$ROOT_DIR\frontend"

# Function to check if a port is in use
function Test-Port {
    param($Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue -InformationLevel Quiet
    return $connection
}

# Check if Node.js is installed
Write-Host "[1/7] Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✓ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "   Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "   ✓ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ npm is not installed!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check if backend directory exists
Write-Host "[2/7] Checking directories..." -ForegroundColor Yellow
if (Test-Path $BACKEND_DIR) {
    Write-Host "   ✓ Backend directory found" -ForegroundColor Green
} else {
    Write-Host "   ✗ Backend directory not found!" -ForegroundColor Red
    exit 1
}

if (Test-Path $FRONTEND_DIR) {
    Write-Host "   ✓ Frontend directory found" -ForegroundColor Green
} else {
    Write-Host "   ✗ Frontend directory not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Install backend dependencies
Write-Host "[3/7] Installing backend dependencies..." -ForegroundColor Yellow
Set-Location $BACKEND_DIR
if (Test-Path "$BACKEND_DIR\node_modules") {
    Write-Host "   ✓ Backend dependencies already installed" -ForegroundColor Green
} else {
    Write-Host "   Installing..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Backend dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Failed to install backend dependencies" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Install frontend dependencies
Write-Host "[4/7] Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location $FRONTEND_DIR
if (Test-Path "$FRONTEND_DIR\node_modules") {
    Write-Host "   ✓ Frontend dependencies already installed" -ForegroundColor Green
} else {
    Write-Host "   Installing... (this may take a few minutes)" -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Frontend dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Failed to install frontend dependencies" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Check if .env files exist
Write-Host "[5/7] Checking environment files..." -ForegroundColor Yellow
if (Test-Path "$BACKEND_DIR\.env") {
    Write-Host "   ✓ Backend .env file exists" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Backend .env file not found - using defaults" -ForegroundColor Yellow
}

if (Test-Path "$FRONTEND_DIR\.env.local") {
    Write-Host "   ✓ Frontend .env.local file exists" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Frontend .env.local not found - creating it..." -ForegroundColor Yellow
    "NEXT_PUBLIC_API_URL=http://localhost:5000/api" | Out-File -FilePath "$FRONTEND_DIR\.env.local" -Encoding utf8
    Write-Host "   ✓ Created .env.local" -ForegroundColor Green
}

Write-Host ""

# Check ports
Write-Host "[6/7] Checking if ports are available..." -ForegroundColor Yellow
if (Test-Port 5000) {
    Write-Host "   ✗ Port 5000 is already in use!" -ForegroundColor Red
    Write-Host "   The backend needs port 5000 to be free." -ForegroundColor Yellow
    Write-Host "   Please stop any application using port 5000 and try again." -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "   ✓ Port 5000 is available (backend)" -ForegroundColor Green
}

if (Test-Port 3000) {
    Write-Host "   ✗ Port 3000 is already in use!" -ForegroundColor Red
    Write-Host "   The frontend needs port 3000 to be free." -ForegroundColor Yellow
    Write-Host "   Please stop any application using port 3000 and try again." -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "   ✓ Port 3000 is available (frontend)" -ForegroundColor Green
}

Write-Host ""

# Test backend connection (if already running)
Write-Host "[7/7] Testing backend connection..." -ForegroundColor Yellow
Set-Location $FRONTEND_DIR
Write-Host "   Running connection test..." -ForegroundColor Cyan
node test-backend.js 2>&1 | Out-Null

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete! Starting servers...   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Write-Host "  Location: $BACKEND_DIR" -ForegroundColor Gray
Write-Host "  URL: http://localhost:5000" -ForegroundColor Gray
Write-Host ""

# Start backend in new window
$backendCmd = "cd '$BACKEND_DIR'; npm start"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd -WindowStyle Normal

Write-Host "Waiting for backend to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Write-Host "  Location: $FRONTEND_DIR" -ForegroundColor Gray
Write-Host "  URL: http://localhost:3000" -ForegroundColor Gray
Write-Host ""

# Start frontend in new window
$frontendCmd = "cd '$FRONTEND_DIR'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  🎉 Servers Starting!                  " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:5000/api/health" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Opening browser in 10 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Open browser
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "✓ Application is running!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Create an account (Sign up)" -ForegroundColor Gray
Write-Host "  2. Login with your credentials" -ForegroundColor Gray
Write-Host "  3. Start sending emails!" -ForegroundColor Gray
Write-Host ""
Write-Host "To stop the servers:" -ForegroundColor Yellow
Write-Host "  - Close the PowerShell windows" -ForegroundColor Gray
Write-Host "  - Or press Ctrl+C in each window" -ForegroundColor Gray
Write-Host ""
Write-Host "For help, check:" -ForegroundColor Yellow
Write-Host "  - QUICK_START.md" -ForegroundColor Gray
Write-Host "  - RUN_COMMANDS.md" -ForegroundColor Gray
Write-Host "  - CHECKLIST.md" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
