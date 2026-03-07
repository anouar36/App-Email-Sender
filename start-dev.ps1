# ============================================
# Email Sender - Development Startup Script
# ============================================

Write-Host @"
╔══════════════════════════════════════════════╗
║   📧 Email Sender - Development Startup    ║
╚══════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Check if Docker is installed
Write-Host "`n🔍 Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed!" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    Write-Host "`nPress any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Create .env file if it doesn't exist
Write-Host "`n📝 Checking backend .env file..." -ForegroundColor Yellow
$envPath = Join-Path $PSScriptRoot "backend\.env"
$envExamplePath = Join-Path $PSScriptRoot "backend\.env.example"

if (-not (Test-Path $envPath)) {
    if (Test-Path $envExamplePath) {
        Copy-Item $envExamplePath $envPath
        Write-Host "✅ Created .env file from template" -ForegroundColor Green
    } else {
        Write-Host "⚠️  .env.example not found, creating basic .env" -ForegroundColor Yellow
        @"
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=email_sender_db
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

FRONTEND_URL=http://localhost:3000
"@ | Out-File -FilePath $envPath -Encoding UTF8
        Write-Host "✅ Created basic .env file" -ForegroundColor Green
    }
} else {
    Write-Host "✅ .env file exists" -ForegroundColor Green
}

# Start PostgreSQL with Docker
Write-Host "`n🐘 Starting PostgreSQL database..." -ForegroundColor Yellow
docker-compose up -d postgres

# Wait for database to be ready
Write-Host "⏳ Waiting for database to initialize..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0

while ($attempt -lt $maxAttempts) {
    Start-Sleep -Seconds 2
    $dbStatus = docker-compose ps postgres 2>&1
    
    if ($dbStatus -match "Up.*healthy" -or $dbStatus -match "Up") {
        Write-Host "✅ Database is ready!" -ForegroundColor Green
        break
    }
    
    $attempt++
    Write-Host "." -NoNewline -ForegroundColor Gray
}

if ($attempt -eq $maxAttempts) {
    Write-Host "`n❌ Database failed to start. Check Docker logs:" -ForegroundColor Red
    docker-compose logs postgres
    Write-Host "`nPress any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Check if backend node_modules exist
Write-Host "`n📦 Checking backend dependencies..." -ForegroundColor Yellow
$backendNodeModules = Join-Path $PSScriptRoot "backend\node_modules"
if (-not (Test-Path $backendNodeModules)) {
    Write-Host "⚠️  Installing backend dependencies..." -ForegroundColor Yellow
    Push-Location (Join-Path $PSScriptRoot "backend")
    npm install
    Pop-Location
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Backend dependencies found" -ForegroundColor Green
}

# Check if frontend node_modules exist
Write-Host "`n📦 Checking frontend dependencies..." -ForegroundColor Yellow
$frontendNodeModules = Join-Path $PSScriptRoot "frontend\node_modules"
if (-not (Test-Path $frontendNodeModules)) {
    Write-Host "⚠️  Installing frontend dependencies..." -ForegroundColor Yellow
    Push-Location (Join-Path $PSScriptRoot "frontend")
    npm install
    Pop-Location
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Frontend dependencies found" -ForegroundColor Green
}

# Start Backend in new window
Write-Host "`n🔧 Starting backend server..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$backendPath'; Write-Host '🔧 Backend Server' -ForegroundColor Cyan; npm start"
)
Write-Host "✅ Backend starting in new window..." -ForegroundColor Green

# Wait a bit for backend to initialize
Start-Sleep -Seconds 5

# Start Frontend in new window
Write-Host "`n🎨 Starting frontend..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "frontend"
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$frontendPath'; Write-Host '🎨 Frontend Server' -ForegroundColor Cyan; npm run dev"
)
Write-Host "✅ Frontend starting in new window..." -ForegroundColor Green

# Display success message
Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║           ✅ APPLICATION STARTED!           ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access Points:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:3001" -ForegroundColor White
Write-Host "   Backend:   http://localhost:5000/api/health" -ForegroundColor White
Write-Host "   Database:  localhost:5432" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Default Login (if you created a user):" -ForegroundColor Cyan
Write-Host "   Email:     admin@example.com" -ForegroundColor White
Write-Host "   Password:  admin123" -ForegroundColor White
Write-Host ""
Write-Host "⚙️  Services Running:" -ForegroundColor Cyan
Write-Host "   ✅ PostgreSQL Database" -ForegroundColor Green
Write-Host "   ✅ Backend API Server" -ForegroundColor Green
Write-Host "   ✅ Frontend Application" -ForegroundColor Green
Write-Host ""
Write-Host "🛑 To Stop:" -ForegroundColor Cyan
Write-Host "   1. Close the backend and frontend PowerShell windows" -ForegroundColor White
Write-Host "   2. Run: docker-compose down" -ForegroundColor White
Write-Host ""
Write-Host "📖 Documentation:" -ForegroundColor Cyan
Write-Host "   COMPLETE_FIX_GUIDE.md" -ForegroundColor White
Write-Host "   CORS_FIX_GUIDE.md" -ForegroundColor White
Write-Host "   PREVIEW_FIX_GUIDE.md" -ForegroundColor White
Write-Host ""

Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
