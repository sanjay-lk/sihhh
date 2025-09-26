@echo off
echo 🚨 SafeRide AI - Quick Start Script
echo ====================================

echo.
echo 📋 Checking prerequisites...

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

echo.
echo 🔧 Setting up Backend...
cd backend

:: Check if node_modules exists
if not exist "node_modules" (
    echo Installing backend dependencies...
    npm install
)

:: Check if .env exists
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please edit backend/.env with your configuration before continuing
    echo Press any key after editing .env file...
    pause
)

echo.
echo 🌐 Setting up Hospital Dashboard...
cd ..\hospital-dashboard

:: Check if node_modules exists
if not exist "node_modules" (
    echo Installing dashboard dependencies...
    npm install
)

echo.
echo 🚀 Starting Services...
echo.
echo Starting Backend API on http://localhost:3001
start "SafeRide AI Backend" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Hospital Dashboard on http://localhost:3000
start "SafeRide AI Dashboard" cmd /k "cd /d %~dp0hospital-dashboard && npm run dev"

echo.
echo ✅ SafeRide AI is starting up!
echo.
echo 📖 Services:
echo    - Backend API: http://localhost:3001
echo    - Hospital Dashboard: http://localhost:3000
echo    - API Health: http://localhost:3001/health
echo.
echo 🔑 Demo Login Credentials:
echo    - Hospital Staff: hospital@saferide.ai / password123
echo    - Admin: admin@saferide.ai / password123
echo.
echo 📚 For detailed setup instructions, see SETUP.md
echo.
echo Press any key to exit...
pause >nul
