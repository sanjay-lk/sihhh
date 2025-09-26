# 🚨 SafeRide AI - Accident Detection & Automated Rescue Dispatch

## 🌍 Overview
SafeRide AI is a comprehensive, AI-powered accident detection system that automatically dispatches rescue services when accidents are detected. The system uses smartphone sensors, machine learning, and real-time communication to save lives by reducing emergency response times.

## 🧩 Problem Statement
- Road accidents kill thousands daily
- Many deaths occur due to delayed emergency response
- Current crash-detection systems are expensive and not widely available
- Need for a web-based, AI-driven, low-cost solution

## 🔗 System Architecture

```
[Driver Mobile App] 
   |-- Accelerometer/Gyroscope Data 
   |-- GPS Location 
   |-- TensorFlow Lite (AI Model) 
   |
   v
[Backend API - Node.js/Express] 
   |-- Stores accident events 
   |-- Runs server-side validation 
   |-- Sends notifications 
   |
   v
[Notification System] 
   |-- Twilio (SMS) 
   |-- Firebase Cloud Messaging 
   |
   v
[Hospital Dashboard - React.js] 
   |-- Live accident map 
   |-- Severity scoring 
   |-- Ambulance tracking 
```

## 📁 Project Structure

```
saferide-ai/
├── backend/                 # Node.js/Express API
├── hospital-dashboard/      # React.js Hospital Interface
├── driver-app/             # React Native Mobile App
├── ai-model/               # TensorFlow accident detection
├── shared/                 # Shared utilities and types
└── docs/                   # Documentation
```

## ⚙️ Tech Stack

### 📱 Mobile App (Driver Side)
- **Framework**: React Native
- **Sensors**: react-native-sensors, react-native-geolocation-service
- **AI/ML**: TensorFlow Lite
- **Real-time**: Socket.IO client

### ☁️ Backend
- **Framework**: Node.js + Express
- **Database**: MongoDB Atlas
- **Real-time**: Socket.IO
- **Notifications**: Twilio SMS API

### 🏥 Hospital Dashboard
- **Framework**: React.js + Tailwind CSS
- **Maps**: Google Maps API / Mapbox
- **Charts**: Recharts
- **Real-time**: Socket.IO client

### 🧠 AI/ML
- **Framework**: TensorFlow / TensorFlow Lite
- **Model Type**: Anomaly detection (LSTM/Autoencoder)
- **Deployment**: Edge computing on mobile devices

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Twilio account (for SMS)
- Google Maps API key
- React Native development environment

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/saferide-ai.git
cd saferide-ai
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

3. **Hospital Dashboard Setup**
```bash
cd hospital-dashboard
npm install
npm start
```

4. **Driver App Setup**
```bash
cd driver-app
npm install
# For iOS
npx react-native run-ios
# For Android
npx react-native run-android
```

## 🔧 Configuration

### Environment Variables
Create `.env` files in respective directories with:

**Backend (.env)**
```
MONGODB_URI=your_mongodb_connection_string
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
GOOGLE_MAPS_API_KEY=your_google_maps_key
JWT_SECRET=your_jwt_secret
PORT=3001
```

**Hospital Dashboard (.env)**
```
REACT_APP_API_URL=http://localhost:3001
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key
REACT_APP_SOCKET_URL=http://localhost:3001
```

## 📊 Features

### Driver Mobile App
- ✅ Real-time sensor monitoring
- ✅ AI-powered accident detection
- ✅ Automatic emergency alerts
- ✅ Manual emergency button
- ✅ Live location sharing
- ✅ Emergency contact management

### Hospital Dashboard
- ✅ Real-time accident feed
- ✅ Interactive accident map
- ✅ Severity scoring system
- ✅ Ambulance dispatch management
- ✅ Response time analytics
- ✅ Multi-hospital coordination

### Backend API
- ✅ RESTful API endpoints
- ✅ Real-time WebSocket communication
- ✅ SMS notification system
- ✅ Accident data analytics
- ✅ User authentication
- ✅ Hospital management

## 🧠 AI Model Details

### Accident Detection Algorithm
1. **Sensor Data Collection**: Accelerometer, gyroscope, GPS speed
2. **Preprocessing**: Data normalization and feature extraction
3. **Anomaly Detection**: LSTM-based model trained on crash patterns
4. **Threshold Analysis**: >5g impact + >40 km/h speed drop in <2 seconds
5. **Confidence Scoring**: 0-100% accident probability

### Training Data
- Public crash datasets (NHTSA, Kaggle)
- Synthetic accident simulations
- Normal driving pattern data
- Edge case scenarios

## 🔔 Notification Flow

1. **Accident Detected** → AI model confirms crash
2. **Location Captured** → GPS coordinates + address lookup
3. **Severity Assessment** → Impact force + speed analysis
4. **Multi-channel Alerts**:
   - SMS to emergency contacts
   - Push notifications to hospitals
   - Real-time dashboard updates
5. **Response Tracking** → Monitor ambulance dispatch

## 🎨 UI/UX Design

### Color Scheme
- **Primary**: #2563EB (Blue-600)
- **Secondary**: #10B981 (Emerald-500)
- **Background**: #F9FAFB (Gray-50)
- **Text**: #111827 (Gray-900)
- **Alerts**: Red #EF4444, Yellow #F59E0B

### Design Principles
- Mobile-first responsive design
- Accessibility compliance (WCAG 2.1)
- Clean, minimal interface
- High contrast for emergency situations
- Intuitive navigation

## 📈 Performance Metrics

### Target KPIs
- **Detection Accuracy**: >95%
- **False Positive Rate**: <2%
- **Response Time**: <30 seconds
- **Battery Impact**: <5% per hour
- **Network Usage**: <10MB per day

## 🔒 Security & Privacy

### Data Protection
- End-to-end encryption for sensitive data
- GDPR compliance for user privacy
- Secure API authentication (JWT)
- Regular security audits
- Minimal data collection principle

### Emergency Override
- Location sharing during emergencies only
- User consent for non-emergency features
- Data retention policies
- Right to data deletion

## 🚀 Deployment

### Production Environment
- **Backend**: AWS EC2 / Heroku
- **Database**: MongoDB Atlas
- **CDN**: CloudFlare
- **Mobile**: App Store / Google Play
- **Web**: Netlify / Vercel

### CI/CD Pipeline
- GitHub Actions for automated testing
- Docker containerization
- Automated deployment on merge
- Environment-specific configurations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@saferide-ai.com or join our Slack channel.

## 🙏 Acknowledgments

- Emergency services worldwide for their dedication
- Open-source community for amazing tools
- Crash survivors who inspired this project
- Healthcare workers on the frontlines

---

**Built with ❤️ to save lives through technology**
