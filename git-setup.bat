@echo off
echo 🚀 SafeRide AI - Git Setup and Push Script
echo ==========================================

echo.
echo 📋 Setting up Git repository...

:: Initialize git repository
git init

:: Add all files
echo Adding all files to git...
git add .

:: Create initial commit
echo Creating initial commit...
git commit -m "🚨 Initial commit: SafeRide AI - Complete accident detection and emergency response system

✨ Features implemented:
- 🔧 Backend API (Node.js/Express) with MongoDB
- 🏥 Hospital Dashboard (React.js) with real-time updates
- 📱 Driver Mobile App (React Native) with sensor monitoring
- 🤖 AI accident detection and analysis
- 📲 SMS notifications via Twilio
- 🌐 Real-time WebSocket communication
- 🗺️ GPS location tracking and geocoding
- 🚑 Emergency response coordination
- 📊 Analytics and reporting dashboard
- 🔐 Secure authentication and authorization

🎯 Ready for production deployment and life-saving operations!"

:: Add remote repository
echo.
echo 🌐 Adding GitHub remote repository...
git branch -M main
git remote add origin https://github.com/sanjay-lk/saferide-ai.git

:: Push to GitHub
echo.
echo 📤 Pushing to GitHub...
echo Please enter your GitHub credentials when prompted.
git push -u origin main

echo.
echo ✅ Successfully pushed SafeRide AI to GitHub!
echo.
echo 🔗 Repository URL: https://github.com/sanjay-lk/saferide-ai
echo.
echo 📚 Next steps:
echo    1. Go to https://github.com/sanjay-lk/saferide-ai
echo    2. Add a description and topics to your repository
echo    3. Enable GitHub Pages if you want to host documentation
echo    4. Set up GitHub Actions for CI/CD (optional)
echo    5. Invite collaborators if working in a team
echo.
echo Press any key to exit...
pause >nul
