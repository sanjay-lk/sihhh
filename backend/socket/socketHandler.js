const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Hospital = require('../models/Hospital');

/**
 * Socket.IO connection handler for real-time communication
 * @param {Object} io - Socket.IO server instance
 */
const socketHandler = (io) => {
  // Middleware for socket authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        // Allow anonymous connections for emergency services
        socket.isAuthenticated = false;
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user || !user.isActive) {
        return next(new Error('Authentication failed'));
      }

      socket.user = user;
      socket.isAuthenticated = true;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      socket.isAuthenticated = false;
      next(); // Allow connection but mark as unauthenticated
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} ${socket.isAuthenticated ? `(User: ${socket.user?._id})` : '(Anonymous)'}`);

    // Handle user joining specific rooms
    socket.on('join_room', async (data) => {
      try {
        const { roomType, roomId } = data;

        if (!socket.isAuthenticated) {
          socket.emit('error', { message: 'Authentication required to join rooms' });
          return;
        }

        switch (roomType) {
          case 'user':
            // Users can only join their own room
            if (socket.user._id.toString() === roomId) {
              socket.join(`user_${roomId}`);
              socket.emit('room_joined', { roomType, roomId });
            } else {
              socket.emit('error', { message: 'Cannot join another user\'s room' });
            }
            break;

          case 'hospital':
            // Check if user is staff of this hospital
            const hospital = await Hospital.findOne({
              hospitalId: roomId,
              'staff.userId': socket.user._id,
              'staff.isActive': true
            });
            
            if (hospital || socket.user.userType === 'admin') {
              socket.join(`hospital_${roomId}`);
              socket.emit('room_joined', { roomType, roomId });
              
              // Notify other hospital staff
              socket.to(`hospital_${roomId}`).emit('staff_online', {
                userId: socket.user._id,
                name: socket.user.fullName,
                timestamp: new Date()
              });
            } else {
              socket.emit('error', { message: 'Not authorized to join this hospital room' });
            }
            break;

          case 'emergency':
            // Emergency responders and hospital staff can join emergency room
            if (['hospital', 'emergency_responder', 'admin'].includes(socket.user.userType)) {
              socket.join('emergency_global');
              socket.emit('room_joined', { roomType: 'emergency', roomId: 'global' });
            } else {
              socket.emit('error', { message: 'Not authorized to join emergency room' });
            }
            break;

          default:
            socket.emit('error', { message: 'Invalid room type' });
        }
      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle leaving rooms
    socket.on('leave_room', (data) => {
      const { roomType, roomId } = data;
      const roomName = `${roomType}_${roomId}`;
      socket.leave(roomName);
      socket.emit('room_left', { roomType, roomId });
    });

    // Handle real-time location updates from drivers
    socket.on('location_update', async (data) => {
      try {
        if (!socket.isAuthenticated || socket.user.userType !== 'driver') {
          socket.emit('error', { message: 'Only authenticated drivers can send location updates' });
          return;
        }

        const { latitude, longitude, accuracy, speed, heading } = data;

        // Validate location data
        if (!latitude || !longitude || 
            latitude < -90 || latitude > 90 || 
            longitude < -180 || longitude > 180) {
          socket.emit('error', { message: 'Invalid location data' });
          return;
        }

        // Update user's last location
        await User.findByIdAndUpdate(socket.user._id, {
          'homeAddress.coordinates.latitude': latitude,
          'homeAddress.coordinates.longitude': longitude,
          lastLocationUpdate: new Date()
        });

        // Broadcast to emergency services if user has location sharing enabled
        if (socket.user.settings?.enableLocationSharing) {
          io.to('emergency_global').emit('driver_location_update', {
            userId: socket.user._id,
            name: socket.user.fullName,
            location: { latitude, longitude, accuracy, speed, heading },
            timestamp: new Date()
          });
        }

        socket.emit('location_update_ack', { timestamp: new Date() });

      } catch (error) {
        console.error('Location update error:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    // Handle real-time sensor data from mobile app
    socket.on('sensor_data', async (data) => {
      try {
        if (!socket.isAuthenticated || socket.user.userType !== 'driver') {
          socket.emit('error', { message: 'Only authenticated drivers can send sensor data' });
          return;
        }

        const { accelerometer, gyroscope, speed, timestamp } = data;

        // Basic validation
        if (!accelerometer || !gyroscope || speed === undefined) {
          socket.emit('error', { message: 'Invalid sensor data format' });
          return;
        }

        // Process sensor data for real-time monitoring
        const { processRealTimeSensorData } = require('../services/aiService');
        
        // Get or initialize user's sensor buffer
        if (!socket.sensorBuffer) {
          socket.sensorBuffer = [];
        }

        const analysis = processRealTimeSensorData(data, socket.sensorBuffer);
        socket.sensorBuffer = analysis.recentReadings;

        // If high alert level, notify emergency services
        if (analysis.alertLevel === 'high') {
          io.to('emergency_global').emit('high_risk_driver', {
            userId: socket.user._id,
            name: socket.user.fullName,
            alertLevel: analysis.alertLevel,
            quickChecks: analysis.quickChecks,
            timestamp: new Date()
          });
        }

        // Send analysis back to driver app
        socket.emit('sensor_analysis', {
          alertLevel: analysis.alertLevel,
          shouldTriggerAnalysis: analysis.shouldTriggerAnalysis,
          timestamp: new Date()
        });

      } catch (error) {
        console.error('Sensor data processing error:', error);
        socket.emit('error', { message: 'Failed to process sensor data' });
      }
    });

    // Handle emergency button press
    socket.on('emergency_button', async (data) => {
      try {
        if (!socket.isAuthenticated) {
          socket.emit('error', { message: 'Authentication required for emergency alerts' });
          return;
        }

        const { location, message } = data;

        // Broadcast emergency alert
        const emergencyAlert = {
          userId: socket.user._id,
          userName: socket.user.fullName,
          userPhone: socket.user.phone,
          location,
          message: message || 'Emergency button pressed',
          timestamp: new Date(),
          type: 'manual_emergency'
        };

        // Send to emergency services
        io.to('emergency_global').emit('manual_emergency_alert', emergencyAlert);

        // Send to user's room for confirmation
        io.to(`user_${socket.user._id}`).emit('emergency_alert_sent', {
          message: 'Emergency alert sent to nearby hospitals and emergency services',
          timestamp: new Date()
        });

        console.log(`Manual emergency alert from user ${socket.user._id}`);

      } catch (error) {
        console.error('Emergency button error:', error);
        socket.emit('error', { message: 'Failed to send emergency alert' });
      }
    });

    // Handle ambulance status updates
    socket.on('ambulance_status_update', async (data) => {
      try {
        if (!socket.isAuthenticated || 
            !['hospital', 'emergency_responder'].includes(socket.user.userType)) {
          socket.emit('error', { message: 'Not authorized to update ambulance status' });
          return;
        }

        const { ambulanceId, status, location, eta, accidentId } = data;

        // Broadcast ambulance update
        const updateData = {
          ambulanceId,
          status,
          location,
          eta,
          accidentId,
          updatedBy: socket.user._id,
          timestamp: new Date()
        };

        // Send to emergency services
        io.to('emergency_global').emit('ambulance_status_update', updateData);

        // Send to specific accident victim if accidentId provided
        if (accidentId) {
          io.emit('ambulance_update_for_accident', {
            accidentId,
            ambulanceStatus: status,
            eta,
            timestamp: new Date()
          });
        }

      } catch (error) {
        console.error('Ambulance status update error:', error);
        socket.emit('error', { message: 'Failed to update ambulance status' });
      }
    });

    // Handle hospital capacity updates
    socket.on('hospital_capacity_update', async (data) => {
      try {
        if (!socket.isAuthenticated || socket.user.userType !== 'hospital') {
          socket.emit('error', { message: 'Only hospital staff can update capacity' });
          return;
        }

        const { hospitalId, bedType, change } = data;

        // Verify user is staff of this hospital
        const hospital = await Hospital.findOne({
          hospitalId,
          'staff.userId': socket.user._id,
          'staff.isActive': true
        });

        if (!hospital) {
          socket.emit('error', { message: 'Not authorized to update this hospital\'s capacity' });
          return;
        }

        // Update capacity
        await hospital.updateBedAvailability(bedType, change);

        // Broadcast capacity update
        const updateData = {
          hospitalId,
          hospitalName: hospital.name,
          bedType,
          change,
          newCapacity: hospital.capacity,
          updatedBy: socket.user._id,
          timestamp: new Date()
        };

        io.to('emergency_global').emit('hospital_capacity_updated', updateData);
        io.to(`hospital_${hospitalId}`).emit('capacity_updated', updateData);

      } catch (error) {
        console.error('Hospital capacity update error:', error);
        socket.emit('error', { message: 'Failed to update hospital capacity' });
      }
    });

    // Handle chat messages (for hospital coordination)
    socket.on('send_message', async (data) => {
      try {
        if (!socket.isAuthenticated) {
          socket.emit('error', { message: 'Authentication required to send messages' });
          return;
        }

        const { roomType, roomId, message, messageType = 'text' } = data;

        if (!message || message.trim().length === 0) {
          socket.emit('error', { message: 'Message cannot be empty' });
          return;
        }

        const messageData = {
          messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          senderId: socket.user._id,
          senderName: socket.user.fullName,
          senderType: socket.user.userType,
          message: message.trim(),
          messageType,
          timestamp: new Date()
        };

        // Send to specific room
        const roomName = `${roomType}_${roomId}`;
        socket.to(roomName).emit('new_message', messageData);
        
        // Send confirmation to sender
        socket.emit('message_sent', { messageId: messageData.messageId, timestamp: messageData.timestamp });

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { roomType, roomId } = data;
      if (socket.isAuthenticated) {
        socket.to(`${roomType}_${roomId}`).emit('user_typing', {
          userId: socket.user._id,
          userName: socket.user.fullName,
          timestamp: new Date()
        });
      }
    });

    socket.on('typing_stop', (data) => {
      const { roomType, roomId } = data;
      if (socket.isAuthenticated) {
        socket.to(`${roomType}_${roomId}`).emit('user_stopped_typing', {
          userId: socket.user._id,
          timestamp: new Date()
        });
      }
    });

    // Handle heartbeat for connection monitoring
    socket.on('heartbeat', () => {
      socket.emit('heartbeat_ack', { timestamp: new Date() });
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`);
      
      if (socket.isAuthenticated) {
        // Notify rooms that user went offline
        socket.rooms.forEach(room => {
          if (room !== socket.id) {
            socket.to(room).emit('user_offline', {
              userId: socket.user._id,
              userName: socket.user.fullName,
              timestamp: new Date()
            });
          }
        });
      }
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  // Periodic cleanup of inactive connections
  setInterval(() => {
    const connectedSockets = io.sockets.sockets.size;
    console.log(`Active socket connections: ${connectedSockets}`);
    
    // Emit system status to admin users
    io.to('emergency_global').emit('system_status', {
      activeConnections: connectedSockets,
      timestamp: new Date()
    });
  }, 60000); // Every minute

  console.log('Socket.IO handler initialized');
};

module.exports = socketHandler;
