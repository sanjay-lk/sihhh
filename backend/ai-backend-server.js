const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');

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

// MongoDB Connection (using in-memory for demo, easily replaceable)
let accidentEvents = [];
let users = [
  {
    id: 'DRV001',
    name: 'John Driver',
    phone: '+1234567890',
    emergencyContacts: [
      { name: 'Jane Doe', phone: '+1234567891', relationship: 'Wife' },
      { name: 'John Sr.', phone: '+1234567892', relationship: 'Father' }
    ]
  }
];

// AI Crash Detection Service (Simulated)
class AIService {
  static async predictCrash(sensorData) {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const { speed, acceleration, gyroscope, impact } = sensorData;
    
    // AI Logic Simulation
    let probability = 0;
    let severity = 'Low';
    let status = 'Normal';
    
    // High G-force detection
    if (acceleration > 3.0) {
      probability = 0.95;
      severity = 'High';
      status = 'Crash Detected';
    }
    // Moderate impact
    else if (acceleration > 2.0 || speed > 100) {
      probability = 0.75;
      severity = 'Medium';
      status = 'Potential Crash';
    }
    // Sudden deceleration
    else if (acceleration < -2.0) {
      probability = 0.65;
      severity = 'Medium';
      status = 'Hard Braking';
    }
    // Normal driving
    else {
      probability = 0.1;
      severity = 'Low';
      status = 'Normal';
    }
    
    return {
      probability,
      severity,
      status,
      confidence: probability * 100,
      aiAnalysis: {
        riskFactors: acceleration > 2.0 ? ['High G-Force'] : [],
        recommendation: probability > 0.7 ? 'Emergency Response Required' : 'Continue Monitoring'
      }
    };
  }
}

// Notification Service (Simulated)
class NotificationService {
  static async sendSMS(phone, message) {
    console.log(`📱 SMS to ${phone}: ${message}`);
    return { success: true, messageId: `sms_${Date.now()}` };
  }
  
  static async sendPushNotification(userId, message) {
    console.log(`🔔 Push to ${userId}: ${message}`);
    return { success: true, notificationId: `push_${Date.now()}` };
  }
  
  static async notifyEmergencyContacts(userId, accidentData) {
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User not found' };
    
    const notifications = [];
    
    for (const contact of user.emergencyContacts) {
      const message = `🚨 EMERGENCY: ${user.name} may have been in an accident. Location: ${accidentData.location.address}. Severity: ${accidentData.severity}. Time: ${new Date().toLocaleString()}`;
      
      const smsResult = await this.sendSMS(contact.phone, message);
      notifications.push({
        contact: contact.name,
        method: 'SMS',
        result: smsResult
      });
    }
    
    return { success: true, notifications };
  }
}

// Escalation Service
class EscalationService {
  static scheduleEscalation(accidentId, delayMinutes = 2) {
    setTimeout(async () => {
      const accident = accidentEvents.find(a => a.id === accidentId);
      if (accident && !accident.acknowledged) {
        console.log(`⚠️ Escalating accident ${accidentId} - No acknowledgment received`);
        
        accident.status = 'Escalated';
        accident.escalated = true;
        accident.escalationTime = new Date();
        
        // Notify hospitals and emergency services
        io.emit('accident_escalated', {
          accidentId,
          message: 'Accident escalated to emergency services',
          severity: 'CRITICAL',
          requiresImmediate: true
        });
        
        // Simulate emergency services notification
        console.log('🚨 EMERGENCY SERVICES NOTIFIED');
        console.log('🏥 HOSPITALS ALERTED');
        console.log('🚓 POLICE DISPATCHED');
      }
    }, delayMinutes * 60 * 1000); // Convert to milliseconds
  }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('join_room', (data) => {
    const { roomType, userId, userType } = data;
    socket.join(`${roomType}_${userId || 'global'}`);
    console.log(`👤 User joined room: ${roomType}_${userId || 'global'} as ${userType}`);
  });

  socket.on('driver_monitoring', (data) => {
    console.log('📊 Driver monitoring data:', data);
    socket.broadcast.emit('live_monitoring', data);
  });

  socket.on('acknowledge_accident', (data) => {
    const { accidentId, userId } = data;
    const accident = accidentEvents.find(a => a.id === accidentId);
    if (accident) {
      accident.acknowledged = true;
      accident.acknowledgedBy = userId;
      accident.acknowledgedAt = new Date();
      console.log(`✅ Accident ${accidentId} acknowledged by ${userId}`);
      
      io.emit('accident_acknowledged', { accidentId, acknowledgedBy: userId });
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// API Endpoints

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'SafeRide AI Backend with AI Integration',
    services: {
      api: 'operational',
      ai: 'active',
      websockets: 'connected',
      notifications: 'ready'
    }
  });
});

// Report Accident Endpoint
app.post('/report-accident', async (req, res) => {
  try {
    const { userId, location, severityScore, timestamp, sensorData } = req.body;
    
    console.log('🚨 Accident report received:', { userId, location, severityScore });
    
    // Call AI microservice for crash detection
    const aiPrediction = await AIService.predictCrash(sensorData);
    
    // Create accident event
    const accidentEvent = {
      id: `ACC_${Date.now()}`,
      userId,
      location: {
        lat: location?.coordinates?.latitude || 40.7128,
        lng: location?.coordinates?.longitude || -74.0060,
        address: location?.address || 'Emergency Location'
      },
      severity: aiPrediction.severity,
      probability: aiPrediction.probability,
      status: aiPrediction.status,
      acknowledged: false,
      timestamp: timestamp || new Date().toISOString(),
      sensorData,
      aiAnalysis: aiPrediction.aiAnalysis,
      confidence: aiPrediction.confidence,
      escalated: false,
      createdAt: new Date()
    };
    
    // Store in database (simulated)
    accidentEvents.unshift(accidentEvent);
    
    // Real-time notification to hospital dashboard
    io.emit('new_accident', accidentEvent);
    io.emit('hospital_feed_update', accidentEvent);
    
    // If high probability crash, trigger notifications
    if (aiPrediction.probability > 0.7) {
      console.log('🚨 High probability crash detected - Triggering notifications');
      
      // Notify emergency contacts
      const notificationResult = await NotificationService.notifyEmergencyContacts(userId, accidentEvent);
      accidentEvent.notificationsSent = notificationResult;
      
      // Schedule escalation if no acknowledgment
      EscalationService.scheduleEscalation(accidentEvent.id, 2);
      
      // Broadcast emergency alert
      io.emit('emergency_alert', {
        ...accidentEvent,
        message: 'CRITICAL: Crash detected with high confidence',
        requiresImmediate: true
      });
    }
    
    res.json({
      success: true,
      data: {
        accidentId: accidentEvent.id,
        aiPrediction,
        status: accidentEvent.status,
        escalationScheduled: aiPrediction.probability > 0.7
      }
    });
    
  } catch (error) {
    console.error('❌ Error reporting accident:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process accident report',
      error: error.message
    });
  }
});

// Notify Contacts Endpoint
app.post('/notify-contacts', async (req, res) => {
  try {
    const { userId, message, urgency = 'normal' } = req.body;
    
    console.log('📞 Notifying contacts for user:', userId);
    
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const notifications = [];
    
    // Send SMS notifications
    for (const contact of user.emergencyContacts) {
      const smsMessage = urgency === 'emergency' 
        ? `🚨 EMERGENCY: ${message}` 
        : `ℹ️ SafeRide Alert: ${message}`;
        
      const smsResult = await NotificationService.sendSMS(contact.phone, smsMessage);
      notifications.push({
        contact: contact.name,
        method: 'SMS',
        status: smsResult.success ? 'sent' : 'failed',
        messageId: smsResult.messageId
      });
    }
    
    // Send push notification
    const pushResult = await NotificationService.sendPushNotification(userId, message);
    notifications.push({
      method: 'Push',
      status: pushResult.success ? 'sent' : 'failed',
      notificationId: pushResult.notificationId
    });
    
    res.json({
      success: true,
      data: {
        notificationsSent: notifications.length,
        notifications
      }
    });
    
  } catch (error) {
    console.error('❌ Error sending notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notifications',
      error: error.message
    });
  }
});

// Hospital Feed Endpoint (WebSocket stream)
app.get('/hospital-feed', (req, res) => {
  res.json({
    success: true,
    message: 'Hospital feed available via WebSocket connection',
    endpoint: 'ws://localhost:3001',
    events: ['new_accident', 'accident_updated', 'emergency_alert', 'accident_escalated'],
    data: {
      recentAccidents: accidentEvents.slice(0, 10),
      totalAccidents: accidentEvents.length,
      activeEmergencies: accidentEvents.filter(a => a.severity === 'High' && !a.acknowledged).length
    }
  });
});

// Driver Status Endpoint
app.get('/driver-status/:userId', (req, res) => {
  const { userId } = req.params;
  
  const userAccidents = accidentEvents
    .filter(a => a.userId === userId)
    .slice(0, 5)
    .map(a => ({
      id: a.id,
      severity: a.severity,
      probability: a.probability,
      status: a.status,
      timestamp: a.timestamp,
      acknowledged: a.acknowledged
    }));
  
  const currentStatus = userAccidents.length > 0 
    ? userAccidents[0].status 
    : 'Normal';
  
  res.json({
    success: true,
    data: {
      userId,
      currentStatus,
      lastPredictions: userAccidents,
      totalReports: accidentEvents.filter(a => a.userId === userId).length,
      safetyScore: Math.max(0, 100 - (userAccidents.filter(a => a.severity !== 'Low').length * 10))
    }
  });
});

// Accept Accident Endpoint
app.post('/accidents/:id/accept', (req, res) => {
  const { id } = req.params;
  const { acceptedBy, hospitalId } = req.body;
  
  const accident = accidentEvents.find(a => a.id === id);
  if (!accident) {
    return res.status(404).json({
      success: false,
      message: 'Accident not found'
    });
  }
  
  accident.status = 'Accepted';
  accident.acceptedBy = acceptedBy;
  accident.hospitalId = hospitalId;
  accident.acceptedAt = new Date();
  accident.acknowledged = true;
  
  // Broadcast update
  io.emit('accident_accepted', {
    accidentId: id,
    acceptedBy,
    hospitalId,
    message: `Accident accepted by ${acceptedBy}`
  });
  
  console.log(`✅ Accident ${id} accepted by ${acceptedBy} at hospital ${hospitalId}`);
  
  res.json({
    success: true,
    data: {
      accidentId: id,
      status: 'Accepted',
      acceptedBy,
      hospitalId,
      acceptedAt: accident.acceptedAt
    }
  });
});

// Dispatch Ambulance Endpoint
app.post('/accidents/:id/dispatch', (req, res) => {
  const { id } = req.params;
  const { ambulanceId, dispatchedBy, estimatedArrival } = req.body;
  
  const accident = accidentEvents.find(a => a.id === id);
  if (!accident) {
    return res.status(404).json({
      success: false,
      message: 'Accident not found'
    });
  }
  
  accident.status = 'Ambulance Dispatched';
  accident.ambulanceId = ambulanceId || `AMB_${Date.now()}`;
  accident.dispatchedBy = dispatchedBy;
  accident.estimatedArrival = estimatedArrival || '4 minutes';
  accident.dispatchedAt = new Date();
  
  // Broadcast ambulance dispatch
  io.emit('ambulance_dispatched', {
    accidentId: id,
    ambulanceId: accident.ambulanceId,
    estimatedArrival: accident.estimatedArrival,
    message: `Ambulance ${accident.ambulanceId} dispatched to accident ${id}`
  });
  
  // Notify driver
  io.emit('driver_notification', {
    userId: accident.userId,
    message: `🚑 Ambulance dispatched! ETA: ${accident.estimatedArrival}`,
    type: 'ambulance_dispatch'
  });
  
  console.log(`🚑 Ambulance ${accident.ambulanceId} dispatched to accident ${id}`);
  
  res.json({
    success: true,
    data: {
      accidentId: id,
      status: 'Ambulance Dispatched',
      ambulanceId: accident.ambulanceId,
      estimatedArrival: accident.estimatedArrival,
      dispatchedAt: accident.dispatchedAt
    }
  });
});

// Get All Accidents
app.get('/accidents', (req, res) => {
  const { status, severity, limit = 20 } = req.query;
  
  let filteredAccidents = [...accidentEvents];
  
  if (status) {
    filteredAccidents = filteredAccidents.filter(a => a.status === status);
  }
  
  if (severity) {
    filteredAccidents = filteredAccidents.filter(a => a.severity === severity);
  }
  
  const limitedAccidents = filteredAccidents.slice(0, parseInt(limit));
  
  res.json({
    success: true,
    data: {
      accidents: limitedAccidents,
      total: filteredAccidents.length,
      filters: { status, severity, limit }
    }
  });
});

// Real-time Driver Sensor Data Endpoint
app.post('/api/driver/sensor-data', async (req, res) => {
  const { driverId, sensorData, timestamp } = req.body;
  
  console.log('📊 Real-time sensor data received:', { 
    driverId, 
    speed: sensorData?.speed, 
    acceleration: sensorData?.acceleration,
    location: sensorData?.coordinates,
    timestamp 
  });
  
  try {
    // Process real-time data with AI if sensor data is available
    let aiAnalysis = null;
    if (sensorData) {
      aiAnalysis = await AIService.predictCrash({
        speed: sensorData.speed || 0,
        acceleration: sensorData.acceleration || 0,
        gyroscope: sensorData.realTimeData?.gyroscope || { x: 0, y: 0, z: 0 },
        impact: (sensorData.acceleration || 0) > 2.5
      });
    }
    
    // Broadcast real-time data to monitoring systems
    io.emit('live_sensor_data', {
      driverId,
      sensorData,
      aiAnalysis,
      timestamp: timestamp || new Date().toISOString(),
      riskLevel: aiAnalysis?.severity || 'Low'
    });
    
    // Check for potential accidents based on AI analysis
    if (aiAnalysis && aiAnalysis.probability > 0.8) {
      console.log('🚨 HIGH RISK DETECTED from real-time data - Probability:', aiAnalysis.probability);
      
      // Auto-trigger emergency alert for high-risk situations
      const autoAccident = {
        id: `AUTO_ACC_${Date.now()}`,
        userId: driverId,
        location: {
          lat: sensorData?.coordinates?.latitude || 40.7128,
          lng: sensorData?.coordinates?.longitude || -74.0060,
          address: sensorData?.location || 'Real-time detected location'
        },
        severity: aiAnalysis.severity,
        probability: aiAnalysis.probability,
        status: 'Auto-Detected by AI',
        acknowledged: false,
        timestamp: new Date().toISOString(),
        sensorData,
        aiAnalysis,
        autoDetected: true,
        escalated: false,
        createdAt: new Date()
      };
      
      accidentEvents.unshift(autoAccident);
      
      io.emit('auto_emergency_detected', autoAccident);
      io.emit('new_accident', autoAccident);
      
      // Schedule escalation for auto-detected accidents (shorter time)
      EscalationService.scheduleEscalation(autoAccident.id, 1); // 1 minute for auto-detected
    }
    
    res.json({
      success: true,
      message: 'Real-time sensor data processed',
      data: {
        processed: true,
        aiAnalysis,
        riskLevel: aiAnalysis?.severity || 'Low',
        autoDetected: aiAnalysis ? aiAnalysis.probability > 0.8 : false,
        timestamp: timestamp || new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error processing sensor data:', error);
    res.json({
      success: true,
      message: 'Sensor data received (AI processing failed)',
      data: {
        processed: true,
        timestamp: timestamp || new Date().toISOString()
      }
    });
  }
});

// AI Prediction Endpoint (Direct)
app.post('/ai/predict', async (req, res) => {
  try {
    const { sensorData } = req.body;
    
    const prediction = await AIService.predictCrash(sensorData);
    
    res.json({
      success: true,
      data: prediction
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI prediction failed',
      error: error.message
    });
  }
});

// Real-time monitoring simulation
setInterval(() => {
  // Simulate live monitoring data
  const mockData = {
    activeDrivers: users.length,
    totalAccidents: accidentEvents.length,
    emergencyAlerts: accidentEvents.filter(a => a.severity === 'High').length,
    timestamp: new Date().toISOString()
  };
  
  io.emit('system_stats', mockData);
}, 10000); // Every 10 seconds

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
server.listen(PORT, () => {
  console.log('🚨 SafeRide AI Backend with AI Integration running on port', PORT);
  console.log('🤖 AI Crash Detection Service: ACTIVE');
  console.log('📡 WebSocket Real-time Communication: ENABLED');
  console.log('📱 SMS/Push Notifications: READY');
  console.log('⚡ Escalation System: ARMED');
  console.log('🔗 Health check: http://localhost:' + PORT + '/health');
  console.log('');
  console.log('📋 API Endpoints:');
  console.log('   POST /report-accident - Report crash with AI analysis');
  console.log('   POST /notify-contacts - Send emergency notifications');
  console.log('   GET  /hospital-feed - Real-time accident feed');
  console.log('   GET  /driver-status/:userId - Driver status & predictions');
  console.log('   POST /accidents/:id/accept - Accept accident at hospital');
  console.log('   POST /accidents/:id/dispatch - Dispatch ambulance');
  console.log('   POST /ai/predict - Direct AI prediction');
});

module.exports = { app, server, io };
