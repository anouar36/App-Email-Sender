@echo off
REM Email Sender Application - Quick Start Script
REM This script starts the application using PowerShell

echo ========================================
echo   Email Sender - Quick Start
echo ========================================
echo.

REM Check if PowerShell is available
where powershell >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PowerShell is not available!
    echo Please run the PowerShell script directly.
    pause
    exit /b 1
)

echo Starting application...
echo.

REM Run the PowerShell script
powershell -ExecutionPolicy Bypass -File "%~dp0start-app.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to start application!
    echo Check the error messages above.
    pause
    exit /b 1
)

exit /b 0
