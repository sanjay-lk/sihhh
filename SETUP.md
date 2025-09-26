# 🚀 SafeRide AI - Setup & Installation Guide

## 📋 Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **npm**: 8.x or higher
- **MongoDB**: 5.x or higher (or MongoDB Atlas account)
- **Git**: Latest version

### For Mobile Development (Optional)
- **React Native CLI**: `npm install -g react-native-cli`
- **Android Studio**: For Android development
- **Xcode**: For iOS development (macOS only)

### External Services
- **Twilio Account**: For SMS notifications
- **Google Maps API Key**: For geocoding and maps
- **Firebase Project**: For push notifications (optional)

## 🛠️ Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/saferide-ai.git
cd saferide-ai
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
```

**Required Environment Variables:**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/saferide-ai
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/saferide-ai

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Twilio SMS (Get from https://console.twilio.com/)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Google Maps (Get from https://console.cloud.google.com/)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3002
```

#### Start Backend Server
```bash
npm run dev
```

The backend will be available at `http://localhost:3001`

### 3. Hospital Dashboard Setup

#### Install Dependencies
```bash
cd hospital-dashboard
npm install
```

#### Environment Configuration
```bash
# Create .env file
touch .env

# Add the following:
VITE_API_URL=http://localhost:3001
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

#### Start Hospital Dashboard
```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000`

### 4. Driver Mobile App Setup (Optional)

#### Install Dependencies
```bash
cd driver-app
npm install
```

#### For Android Development
```bash
# Install Android dependencies
cd android
./gradlew clean

# Run on Android
cd ..
npm run android
```

#### For iOS Development (macOS only)
```bash
# Install iOS dependencies
cd ios
pod install

# Run on iOS
cd ..
npm run ios
```

## 🗄️ Database Setup

### Option 1: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. The application will create collections automatically

### Option 2: MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and add to `.env`
4. Whitelist your IP address

## 🔑 External Service Setup

### Twilio SMS Setup
1. Create account at [Twilio](https://www.twilio.com/)
2. Get Account SID and Auth Token from Console
3. Purchase a phone number
4. Add credentials to `.env`

### Google Maps API Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Maps JavaScript API and Geocoding API
4. Create API key and add to `.env`

### Firebase Setup (Optional - for push notifications)
1. Create project at [Firebase Console](https://console.firebase.google.com/)
2. Add Android/iOS app
3. Download configuration files
4. Add to mobile app

## 🚀 Running the Complete System

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Start Hospital Dashboard
```bash
cd hospital-dashboard
npm run dev
```

### 3. Start Mobile App (Optional)
```bash
cd driver-app
npm run android  # or npm run ios
```

## 🧪 Testing the System

### 1. Access Hospital Dashboard
- Open `http://localhost:3000`
- Login with demo credentials:
  - **Hospital Staff**: `hospital@saferide.ai` / `password123`
  - **Admin**: `admin@saferide.ai` / `password123`

### 2. Test API Endpoints
```bash
# Health check
curl http://localhost:3001/health

# Login test
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hospital@saferide.ai","password":"password123"}'
```

### 3. Test Real-time Features
1. Open multiple browser tabs with the dashboard
2. Simulate accident detection via API
3. Observe real-time updates across tabs

## 📱 Mobile App Testing

### Simulator/Emulator Testing
```bash
# Android Emulator
npm run android

# iOS Simulator (macOS only)
npm run ios
```

### Physical Device Testing
1. Enable Developer Mode on device
2. Connect via USB
3. Run `npm run android` or `npm run ios`

## 🔧 Troubleshooting

### Common Issues

#### Backend Issues
```bash
# Port already in use
lsof -ti:3001 | xargs kill -9

# MongoDB connection issues
# Check MongoDB is running and connection string is correct

# Missing dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Frontend Issues
```bash
# Clear cache and reinstall
rm -rf node_modules .next package-lock.json
npm install

# Port issues
# Change port in vite.config.js or package.json
```

#### Mobile App Issues
```bash
# React Native cache issues
npx react-native start --reset-cache

# Android build issues
cd android && ./gradlew clean && cd ..

# iOS build issues (macOS)
cd ios && pod install && cd ..
```

### Environment Issues
- Ensure all environment variables are set correctly
- Check API keys are valid and have proper permissions
- Verify database connection strings

### Network Issues
- Check firewall settings
- Ensure ports 3000, 3001 are available
- For mobile testing, use your computer's IP instead of localhost

## 📊 System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Driver App    │    │ Hospital Dash   │    │   Backend API   │
│  (React Native) │◄──►│   (React.js)    │◄──►│ (Node.js/Express│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Sensors &     │    │   Real-time     │    │    MongoDB      │
│   Location      │    │   Updates       │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 Key Features Implemented

### ✅ Backend API
- User authentication & authorization
- Accident detection & management
- Hospital & ambulance management
- Real-time WebSocket communication
- SMS notifications via Twilio
- AI accident analysis
- RESTful API endpoints

### ✅ Hospital Dashboard
- Real-time accident monitoring
- Interactive dashboard with live updates
- Accident management & response
- Hospital resource tracking
- Modern responsive UI with Tailwind CSS
- WebSocket integration for live data

### ✅ Driver Mobile App
- User authentication
- Sensor data monitoring
- Location tracking
- Emergency alert system
- Cross-platform (iOS/Android)

### ✅ AI/ML Components
- Accident detection algorithm
- Sensor data analysis
- Confidence scoring
- Real-time processing

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Input validation
- SQL injection prevention
- XSS protection

## 📈 Performance Optimizations

- Database indexing
- Connection pooling
- Caching strategies
- Optimized queries
- Lazy loading
- Code splitting

## 🚀 Deployment Ready

The system is configured for easy deployment to:
- **Backend**: Heroku, AWS EC2, DigitalOcean
- **Frontend**: Netlify, Vercel, AWS S3
- **Database**: MongoDB Atlas
- **Mobile**: App Store, Google Play Store

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the logs for error messages
3. Ensure all prerequisites are installed
4. Verify environment configuration

## 🎉 Success!

If everything is set up correctly, you should see:
1. Backend API running on `http://localhost:3001`
2. Hospital Dashboard on `http://localhost:3000`
3. Mobile app running on simulator/device
4. Real-time updates working between components
5. SMS notifications being sent (if Twilio is configured)

The SafeRide AI system is now ready to save lives through technology! 🚨❤️
