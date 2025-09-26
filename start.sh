#!/bin/bash

echo "🚨 SafeRide AI - Quick Start Script"
echo "===================================="
echo

echo "📋 Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ Node.js and npm are installed"
echo

echo "🔧 Setting up Backend..."
cd backend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your configuration before continuing"
    echo "Press Enter after editing .env file..."
    read
fi

echo
echo "🌐 Setting up Hospital Dashboard..."
cd ../hospital-dashboard

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dashboard dependencies..."
    npm install
fi

echo
echo "🚀 Starting Services..."
echo

# Start backend in background
echo "Starting Backend API on http://localhost:3001"
cd ../backend
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start dashboard in background
echo "Starting Hospital Dashboard on http://localhost:3000"
cd ../hospital-dashboard
npm run dev &
DASHBOARD_PID=$!

echo
echo "✅ SafeRide AI is starting up!"
echo
echo "📖 Services:"
echo "   - Backend API: http://localhost:3001"
echo "   - Hospital Dashboard: http://localhost:3000"
echo "   - API Health: http://localhost:3001/health"
echo
echo "🔑 Demo Login Credentials:"
echo "   - Hospital Staff: hospital@saferide.ai / password123"
echo "   - Admin: admin@saferide.ai / password123"
echo
echo "📚 For detailed setup instructions, see SETUP.md"
echo
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
trap "echo; echo 'Stopping services...'; kill $BACKEND_PID $DASHBOARD_PID 2>/dev/null; exit" INT

# Keep script running
wait
