const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3002"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3002"],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'SafeRide AI Backend is running'
  });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Demo users
  const users = {
    'hospital@saferide.ai': {
      id: '1',
      firstName: 'Hospital',
      lastName: 'Staff',
      email: 'hospital@saferide.ai',
      userType: 'hospital'
    },
    'admin@saferide.ai': {
      id: '2',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@saferide.ai',
      userType: 'admin'
    },
    'driver@saferide.ai': {
      id: '3',
      firstName: 'John',
      lastName: 'Driver',
      email: 'driver@saferide.ai',
      userType: 'driver'
    }
  };

  if (users[email] && password === 'password123') {
    res.json({
      success: true,
      data: {
        token: 'demo-token-' + Date.now(),
        user: users[email]
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
});

// Get user profile
app.get('/api/auth/me', (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: '1',
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@saferide.ai',
        userType: 'hospital'
      }
    }
  });
});

// Emergency alert endpoint
app.post('/api/emergency-alert', (req, res) => {
  const { driverId, location, severity, timestamp } = req.body;
  
  console.log('🚨 EMERGENCY ALERT RECEIVED:', {
    driverId,
    location,
    severity,
    timestamp
  });
  
  // Broadcast to all connected clients
  io.emit('emergency_alert', {
    accidentId: 'ACC-EMERGENCY-' + Date.now(),
    driverId,
    location,
    severity,
    timestamp,
    status: 'EMERGENCY - Ambulance Dispatched'
  });
  
  res.json({
    success: true,
    message: 'Emergency alert sent to all hospitals',
    data: {
      alertId: 'ALERT-' + Date.now(),
      hospitalCount: 12,
      ambulanceDispatched: true,
      estimatedArrival: '4 minutes'
    }
  });
});

// Accidents endpoints
app.get('/api/accidents', (req, res) => {
  res.json({
    success: true,
    data: {
      accidents: [
        {
          _id: '1',
          accidentId: 'ACC-DEMO-001',
          severity: 'moderate',
          status: 'confirmed',
          location: {
            coordinates: { latitude: 40.7128, longitude: -74.0060 },
            address: { formattedAddress: 'Times Square, New York, NY' }
          },
          detectedAt: new Date().toISOString(),
          aiAnalysis: { confidenceScore: 85 }
        }
      ],
      pagination: { page: 1, limit: 20, total: 1, pages: 1 }
    }
  });
});

// Statistics endpoints
app.get('/api/accidents/statistics/summary', (req, res) => {
  res.json({
    success: true,
    data: {
      statistics: {
        totalAccidents: 5,
        confirmedAccidents: 3,
        falseAlarms: 1,
        avgResponseTime: 240
      }
    }
  });
});

app.get('/api/hospitals/statistics/system', (req, res) => {
  res.json({
    success: true,
    data: {
      statistics: {
        totalHospitals: 12,
        totalBeds: 500,
        availableBeds: 120,
        totalAmbulances: 25,
        availableAmbulances: 8,
        avgResponseTime: 300
      }
    }
  });
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send demo accident every 10 seconds
  const interval = setInterval(() => {
    socket.emit('accident_detected', {
      accidentId: 'ACC-' + Date.now(),
      severity: ['minor', 'moderate', 'severe'][Math.floor(Math.random() * 3)],
      location: {
        coordinates: { 
          latitude: 40.7128 + (Math.random() - 0.5) * 0.1, 
          longitude: -74.0060 + (Math.random() - 0.5) * 0.1 
        }
      },
      timestamp: new Date().toISOString()
    });
  }, 10000);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    clearInterval(interval);
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚨 SafeRide AI Backend running on port ${PORT}`);
  console.log(`📡 Socket.IO enabled for real-time communication`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = { app, server, io };
