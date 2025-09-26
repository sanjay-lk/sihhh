# 🚀 SafeRide AI - Deployment Guide

## 🌐 Production Deployment Options

### Backend Deployment

#### Option 1: Heroku (Recommended for beginners)
```bash
# Install Heroku CLI
# Create Heroku app
heroku create saferide-ai-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_atlas_uri
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set TWILIO_ACCOUNT_SID=your_twilio_sid
heroku config:set TWILIO_AUTH_TOKEN=your_twilio_token
heroku config:set TWILIO_PHONE_NUMBER=your_twilio_phone
heroku config:set GOOGLE_MAPS_API_KEY=your_google_maps_key

# Deploy
git subtree push --prefix backend heroku main
```

#### Option 2: AWS EC2
```bash
# Launch EC2 instance
# Install Node.js and PM2
sudo apt update
sudo apt install nodejs npm
sudo npm install -g pm2

# Clone repository
git clone https://github.com/sanjay-lk/saferide-ai.git
cd saferide-ai/backend

# Install dependencies
npm install --production

# Set up environment variables
cp .env.example .env
# Edit .env with production values

# Start with PM2
pm2 start server.js --name "saferide-backend"
pm2 startup
pm2 save
```

### Frontend Deployment

#### Hospital Dashboard - Netlify
```bash
# Build the project
cd hospital-dashboard
npm run build

# Deploy to Netlify
# Option 1: Drag and drop dist folder to Netlify
# Option 2: Connect GitHub repository to Netlify
```

#### Hospital Dashboard - Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd hospital-dashboard
vercel --prod
```

### Mobile App Deployment

#### Android - Google Play Store
```bash
cd driver-app
# Generate signed APK
cd android
./gradlew assembleRelease

# Upload to Google Play Console
```

#### iOS - App Store
```bash
cd driver-app
# Build for iOS
cd ios
xcodebuild -workspace SafeRideAI.xcworkspace -scheme SafeRideAI -configuration Release

# Upload to App Store Connect via Xcode
```

## 🔧 Environment Configuration

### Production Environment Variables

**Backend (.env)**
```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/saferide-ai-prod
JWT_SECRET=super-secure-jwt-secret-for-production
JWT_EXPIRES_IN=7d
TWILIO_ACCOUNT_SID=your_production_twilio_sid
TWILIO_AUTH_TOKEN=your_production_twilio_token
TWILIO_PHONE_NUMBER=your_production_phone
GOOGLE_MAPS_API_KEY=your_production_google_maps_key
CORS_ORIGIN=https://your-dashboard-domain.com
```

**Frontend (.env)**
```env
VITE_API_URL=https://your-backend-domain.com
VITE_GOOGLE_MAPS_API_KEY=your_production_google_maps_key
```

## 📊 Monitoring & Analytics

### Backend Monitoring
- Use PM2 for process management
- Set up log rotation
- Monitor with tools like New Relic or DataDog
- Set up health check endpoints

### Frontend Monitoring
- Use Google Analytics
- Set up error tracking with Sentry
- Monitor performance with Lighthouse

## 🔒 Security Checklist

- [ ] Use HTTPS in production
- [ ] Set secure JWT secrets
- [ ] Enable CORS properly
- [ ] Use environment variables for secrets
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Regular security updates

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)
1. Create production cluster
2. Set up database users
3. Configure IP whitelist
4. Enable backup
5. Set up monitoring

## 📱 Mobile App Store Guidelines

### Google Play Store
- Follow Android app guidelines
- Set up proper permissions
- Add privacy policy
- Test on multiple devices

### Apple App Store
- Follow iOS Human Interface Guidelines
- Set up proper entitlements
- Add privacy policy
- Test on multiple iOS versions

## 🚀 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy SafeRide AI

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "saferide-ai-backend"
        heroku_email: "your-email@example.com"
        appdir: "backend"

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v1.2
      with:
        publish-dir: './hospital-dashboard/dist'
        production-branch: main
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 📈 Scaling Considerations

### Backend Scaling
- Use load balancers
- Implement database sharding
- Use Redis for caching
- Set up CDN for static assets

### Database Scaling
- Use MongoDB Atlas auto-scaling
- Implement read replicas
- Optimize queries and indexes
- Monitor performance metrics

## 🔧 Maintenance

### Regular Tasks
- Update dependencies
- Monitor logs
- Backup database
- Performance optimization
- Security patches

### Monitoring Alerts
- Set up alerts for:
  - High CPU usage
  - Memory leaks
  - Database connection issues
  - API response times
  - Error rates

## 📞 Production Support

### Error Handling
- Implement proper error logging
- Set up error tracking (Sentry)
- Create error response standards
- Monitor error rates

### Performance Monitoring
- Track API response times
- Monitor database query performance
- Set up uptime monitoring
- Track user engagement metrics
