# ============================================
# AUTO_MAILER - Start Backend + Frontend
# ============================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   AUTO_MAILER - Starting Application   " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""                      
                          
# Kill anything on port 5000 or 3000 first
Write-Host ">> Freeing ports 5000 and 3000..." -ForegroundColor Yellow
$port5000 = netstat -ano | Select-String ":5000 " | Select-String "LISTENING"
$port3000 = netstat -ano | Select-String ":3000 " | Select-String "LISTENING"

if ($port5000) {
    $pid5000 = ($port5000 -split "\s+")[-1]
    taskkill /F /PID $pid5000 2>$null | Out-Null
    Write-Host "   Killed process on port 5000 (PID: $pid5000)" -ForegroundColor Gray
}
if ($port3000) {
    $pid3000 = ($port3000 -split "\s+")[-1]
    taskkill /F /PID $pid3000 2>$null | Out-Null
    Write-Host "   Killed process on port 3000 (PID: $pid3000)" -ForegroundColor Gray
}
       
Start-Sleep -Seconds 1         

# Start Backend
Write-Host ""
Write-Host ">> Starting Backend on http://localhost:5000 ..." -ForegroundColor Cyan
$backend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Youcode\Desktop\App-Email-Sender\backend'; node src/server.js" -PassThru

Start-Sleep -Seconds 2

# Start Frontend
Write-Host ">> Starting Frontend on http://localhost:3000 ..." -ForegroundColor Cyan
$frontend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Youcode\Desktop\App-Email-Sender\frontend'; npm run dev" -PassThru

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  BACKEND  -> http://localhost:5000     " -ForegroundColor Green
Write-Host "  FRONTEND -> http://localhost:3000     " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Both servers are running in separate windows." -ForegroundColor White
Write-Host "Press any key to open the app in browser..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Start-Process "http://localhost:3000"
