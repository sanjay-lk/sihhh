const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3002"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3002"],
  credentials: true
}));
app.use(express.json());

// In-memory database (for demo purposes)
let users = [
  {
    id: 1,
    email: 'hospital@saferide.ai',
    password: 'password123',
    firstName: 'Hospital',
    lastName: 'Staff',
    userType: 'hospital',
    hospitalId: 'HOSP001'
  },
  {
    id: 2,
    email: 'driver@saferide.ai',
    password: 'password123',
    firstName: 'John',
    lastName: 'Driver',
    userType: 'driver',
    driverId: 'DRV001'
  },
  {
    id: 3,
    email: 'admin@saferide.ai',
    password: 'password123',
    firstName: 'Admin',
    lastName: 'User',
    userType: 'admin'
  }
];

let accidents = [
  {
    id: 'ACC-001',
    accidentId: 'ACC-DEMO-001',
    severity: 'CRITICAL',
    status: 'Ambulance Dispatched',
    location: {
      coordinates: { latitude: 40.7128, longitude: -74.0060 },
      address: 'Times Square, NYC'
    },
    driverId: 'DRV001',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    aiAnalysis: {
      confidence: 94,
      vehicleCount: 2,
      injuriesDetected: true,
      emergencyRequired: true
    },
    responseTime: 240,
    hospitalNotified: true,
    ambulanceDispatched: true
  },
  {
    id: 'ACC-002',
    accidentId: 'ACC-DEMO-002',
    severity: 'SEVERE',
    status: 'Confirmed',
    location: {
      coordinates: { latitude: 40.7589, longitude: -73.9851 },
      address: 'Brooklyn Bridge, NYC'
    },
    driverId: 'DRV002',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    aiAnalysis: {
      confidence: 89,
      vehicleCount: 1,
      injuriesDetected: true,
      emergencyRequired: true
    },
    responseTime: 180,
    hospitalNotified: true,
    ambulanceDispatched: false
  },
  {
    id: 'ACC-003',
    accidentId: 'ACC-DEMO-003',
    severity: 'MODERATE',
    status: 'Responded',
    location: {
      coordinates: { latitude: 40.7831, longitude: -73.9712 },
      address: 'Central Park, NYC'
    },
    driverId: 'DRV003',
    timestamp: new Date(Date.now() - 480000).toISOString(),
    aiAnalysis: {
      confidence: 76,
      vehicleCount: 1,
      injuriesDetected: false,
      emergencyRequired: false
    },
    responseTime: 320,
    hospitalNotified: true,
    ambulanceDispatched: false
  }
];

let hospitals = [
  {
    id: 'HOSP001',
    name: 'Mount Sinai Hospital',
    location: { latitude: 40.7903, longitude: -73.9565 },
    totalBeds: 50,
    availableBeds: 15,
    icuBeds: 20,
    availableIcuBeds: 5,
    emergencyBeds: 30,
    availableEmergencyBeds: 12,
    status: 'operational',
    contactNumber: '+1234567890'
  },
  {
    id: 'HOSP002',
    name: 'NYU Langone Health',
    location: { latitude: 40.7391, longitude: -73.9719 },
    totalBeds: 45,
    availableBeds: 12,
    icuBeds: 15,
    availableIcuBeds: 3,
    emergencyBeds: 25,
    availableEmergencyBeds: 8,
    status: 'operational',
    contactNumber: '+1234567891'
  }
];

let ambulances = [
  {
    id: 'AMB001',
    unitNumber: 'Unit 001',
    status: 'available',
    location: { latitude: 40.7580, longitude: -73.9855 },
    hospitalId: 'HOSP001',
    driverId: 'AMBDRV001',
    equipment: ['defibrillator', 'oxygen', 'stretcher', 'medications']
  },
  {
    id: 'AMB002',
    unitNumber: 'Unit 002',
    status: 'dispatched',
    location: { latitude: 40.7505, longitude: -73.9934 },
    hospitalId: 'HOSP001',
    driverId: 'AMBDRV002',
    assignedAccident: 'ACC-001',
    equipment: ['defibrillator', 'oxygen', 'stretcher', 'medications']
  }
];

let emergencyContacts = [
  {
    id: 1,
    driverId: 'DRV001',
    name: 'John Doe',
    relationship: 'Father',
    phone: '+1234567890',
    email: 'john.doe@email.com',
    smsAlerts: true,
    callAlerts: true
  },
  {
    id: 2,
    driverId: 'DRV001',
    name: 'Jane Smith',
    relationship: 'Wife',
    phone: '+1234567891',
    email: 'jane.smith@email.com',
    smsAlerts: true,
    callAlerts: true
  }
];

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  // Join room based on user type
  socket.on('join_room', (data) => {
    const { roomType, roomId, userType } = data;
    socket.join(`${roomType}_${roomId}`);
    console.log(`👤 User joined room: ${roomType}_${roomId} as ${userType}`);
  });

  // Handle emergency alerts
  socket.on('emergency_alert', (data) => {
    console.log('🚨 Emergency alert received:', data);
    
    // Broadcast to all hospital rooms
    io.to('emergency_global').emit('new_emergency', {
      ...data,
      timestamp: new Date().toISOString()
    });
    
    // Broadcast to all connected clients
    io.emit('emergency_broadcast', data);
  });

  // Handle sensor data updates
  socket.on('sensor_update', (data) => {
    console.log('📊 Sensor data update:', data);
    
    // Broadcast to monitoring rooms
    io.to('monitoring_global').emit('sensor_data', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'SafeRide AI Backend is running',
    services: {
      database: 'connected',
      socketio: 'active',
      api: 'operational'
    }
  });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Generate token (simplified for demo)
  const token = `token_${user.id}_${Date.now()}`;

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        hospitalId: user.hospitalId,
        driverId: user.driverId
      }
    }
  });
});

// Get user profile
app.get('/api/auth/me', (req, res) => {
  // Simplified auth check for demo
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Authorization header required'
    });
  }

  res.json({
    success: true,
    data: {
      user: {
        id: 1,
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
  const { driverId, location, severity, timestamp, sensorData } = req.body;
  
  console.log('🚨 EMERGENCY ALERT RECEIVED:', {
    driverId,
    location,
    severity,
    timestamp,
    sensorData
  });

  // Create new accident record
  const newAccident = {
    id: `ACC-EMERGENCY-${Date.now()}`,
    accidentId: `ACC-EMERGENCY-${Date.now()}`,
    severity: severity || 'CRITICAL',
    status: 'EMERGENCY - Ambulance Dispatched',
    location: {
      coordinates: location?.coordinates || { latitude: 40.7128, longitude: -74.0060 },
      address: location?.address || 'Emergency Location'
    },
    driverId: driverId || 'UNKNOWN',
    timestamp: timestamp || new Date().toISOString(),
    aiAnalysis: {
      confidence: 95,
      vehicleCount: 1,
      injuriesDetected: true,
      emergencyRequired: true
    },
    responseTime: null,
    hospitalNotified: true,
    ambulanceDispatched: true,
    sensorData: sensorData
  };

  // Add to accidents array
  accidents.unshift(newAccident);

  // Broadcast to all connected clients
  io.emit('emergency_alert', newAccident);
  io.emit('new_accident', newAccident);
  
  res.json({
    success: true,
    message: 'Emergency alert sent to all hospitals',
    data: {
      alertId: newAccident.id,
      hospitalCount: hospitals.length,
      ambulanceDispatched: true,
      estimatedArrival: '4 minutes',
      accident: newAccident
    }
  });
});

// Accidents endpoints
app.get('/api/accidents', (req, res) => {
  const { page = 1, limit = 20, severity, status } = req.query;
  
  let filteredAccidents = [...accidents];
  
  if (severity) {
    filteredAccidents = filteredAccidents.filter(acc => acc.severity === severity);
  }
  
  if (status) {
    filteredAccidents = filteredAccidents.filter(acc => acc.status === status);
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedAccidents = filteredAccidents.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: {
      accidents: paginatedAccidents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredAccidents.length,
        pages: Math.ceil(filteredAccidents.length / limit)
      }
    }
  });
});

app.get('/api/accidents/:id', (req, res) => {
  const accident = accidents.find(acc => acc.id === req.params.id);
  
  if (!accident) {
    return res.status(404).json({
      success: false,
      message: 'Accident not found'
    });
  }
  
  res.json({
    success: true,
    data: { accident }
  });
});

app.put('/api/accidents/:id', (req, res) => {
  const accidentIndex = accidents.findIndex(acc => acc.id === req.params.id);
  
  if (accidentIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Accident not found'
    });
  }
  
  accidents[accidentIndex] = { ...accidents[accidentIndex], ...req.body };
  
  // Broadcast update
  io.emit('accident_updated', accidents[accidentIndex]);
  
  res.json({
    success: true,
    data: { accident: accidents[accidentIndex] }
  });
});

// Hospital endpoints
app.get('/api/hospitals', (req, res) => {
  res.json({
    success: true,
    data: { hospitals }
  });
});

app.get('/api/hospitals/statistics/system', (req, res) => {
  const totalBeds = hospitals.reduce((sum, h) => sum + h.totalBeds, 0);
  const availableBeds = hospitals.reduce((sum, h) => sum + h.availableBeds, 0);
  const totalAmbulances = ambulances.length;
  const availableAmbulances = ambulances.filter(a => a.status === 'available').length;
  
  res.json({
    success: true,
    data: {
      statistics: {
        totalHospitals: hospitals.length,
        totalBeds,
        availableBeds,
        totalAmbulances,
        availableAmbulances,
        avgResponseTime: 300
      }
    }
  });
});

// Ambulance endpoints
app.get('/api/ambulances', (req, res) => {
  res.json({
    success: true,
    data: { ambulances }
  });
});

app.post('/api/ambulances/dispatch', (req, res) => {
  const { accidentId, ambulanceId } = req.body;
  
  const ambulance = ambulances.find(a => a.id === ambulanceId);
  const accident = accidents.find(a => a.id === accidentId);
  
  if (!ambulance || !accident) {
    return res.status(404).json({
      success: false,
      message: 'Ambulance or accident not found'
    });
  }
  
  // Update ambulance status
  ambulance.status = 'dispatched';
  ambulance.assignedAccident = accidentId;
  
  // Update accident status
  accident.ambulanceDispatched = true;
  accident.status = 'Ambulance Dispatched';
  
  // Broadcast updates
  io.emit('ambulance_dispatched', { ambulance, accident });
  
  res.json({
    success: true,
    data: { ambulance, accident }
  });
});

// Emergency contacts endpoints
app.get('/api/emergency-contacts/:driverId', (req, res) => {
  const contacts = emergencyContacts.filter(c => c.driverId === req.params.driverId);
  
  res.json({
    success: true,
    data: { contacts }
  });
});

app.post('/api/emergency-contacts', (req, res) => {
  const newContact = {
    id: emergencyContacts.length + 1,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  emergencyContacts.push(newContact);
  
  res.json({
    success: true,
    data: { contact: newContact }
  });
});

// Statistics endpoints
app.get('/api/accidents/statistics/summary', (req, res) => {
  const totalAccidents = accidents.length;
  const criticalAccidents = accidents.filter(a => a.severity === 'CRITICAL').length;
  const avgResponseTime = accidents.reduce((sum, a) => sum + (a.responseTime || 0), 0) / totalAccidents;
  
  res.json({
    success: true,
    data: {
      statistics: {
        totalAccidents,
        criticalAccidents,
        avgResponseTime: Math.round(avgResponseTime)
      }
    }
  });
});

// Driver sensor data endpoint
app.post('/api/driver/sensor-data', (req, res) => {
  const { driverId, sensorData } = req.body;
  
  console.log('📊 Sensor data received:', { driverId, sensorData });
  
  // Broadcast sensor data to monitoring systems
  io.emit('sensor_data_update', {
    driverId,
    sensorData,
    timestamp: new Date().toISOString()
  });
  
  // Check for potential accidents based on sensor data
  if (sensorData.acceleration > 3.0 || sensorData.speed > 100) {
    console.log('⚠️ Potential accident detected from sensor data');
    
    // Auto-trigger emergency alert
    const emergencyAlert = {
      driverId,
      location: sensorData.location,
      severity: 'CRITICAL',
      timestamp: new Date().toISOString(),
      sensorData,
      autoDetected: true
    };
    
    io.emit('auto_emergency_detected', emergencyAlert);
  }
  
  res.json({
    success: true,
    message: 'Sensor data processed',
    data: {
      processed: true,
      timestamp: new Date().toISOString()
    }
  });
});

// Location sharing endpoint
app.post('/api/driver/share-location', (req, res) => {
  const { driverId, location } = req.body;
  
  console.log('📍 Location shared:', { driverId, location });
  
  // Broadcast location to emergency services
  io.emit('location_shared', {
    driverId,
    location,
    timestamp: new Date().toISOString()
  });
  
  res.json({
    success: true,
    message: 'Location shared with emergency services',
    data: {
      nearbyHospitals: hospitals.slice(0, 3),
      nearbyAmbulances: ambulances.filter(a => a.status === 'available').slice(0, 2),
      estimatedResponseTime: '4 minutes'
    }
  });
});

// Real-time updates simulation
setInterval(() => {
  // Simulate sensor data updates
  const mockSensorData = {
    driverId: 'DRV001',
    speed: Math.random() * 80 + 20,
    acceleration: Math.random() * 2 + 0.8,
    location: 'Main Street, City Center',
    timestamp: new Date().toISOString()
  };
  
  io.emit('live_sensor_update', mockSensorData);
}, 5000);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
server.listen(PORT, () => {
  console.log('🚨 SafeRide AI Backend running on port', PORT);
  console.log('📡 Socket.IO enabled for real-time communication');
  console.log('🔗 Health check: http://localhost:' + PORT + '/health');
  console.log('🏥 Hospital Dashboard: http://localhost:3000');
  console.log('🚗 Driver Dashboard: http://localhost:3002');
});

module.exports = { app, server, io };
