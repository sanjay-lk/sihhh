const twilio = require('twilio');
const admin = require('firebase-admin');
const User = require('../models/User');
const Hospital = require('../models/Hospital');

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Initialize Firebase Admin (for push notifications)
// Note: In production, you would initialize this with proper service account credentials
let firebaseApp;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
} catch (error) {
  console.warn('Firebase Admin not initialized:', error.message);
}

/**
 * Send SMS notification using Twilio
 * @param {string} to - Phone number to send SMS to
 * @param {string} message - Message content
 * @param {string} priority - Priority level (low, normal, high, urgent)
 * @returns {Promise<Object>} Twilio response
 */
const sendSMS = async (to, message, priority = 'normal') => {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error('Twilio credentials not configured');
    }

    const messageOptions = {
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    };

    // Add priority-specific options
    if (priority === 'urgent' || priority === 'high') {
      messageOptions.statusCallback = `${process.env.API_BASE_URL}/api/notifications/sms/status`;
    }

    const result = await twilioClient.messages.create(messageOptions);
    
    console.log(`SMS sent successfully to ${to}. SID: ${result.sid}`);
    return result;

  } catch (error) {
    console.error('SMS sending error:', error);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
};

/**
 * Send push notification using Firebase Cloud Messaging
 * @param {string} token - FCM token
 * @param {Object} notification - Notification payload
 * @param {string} priority - Priority level (low, normal, high)
 * @returns {Promise<string>} Message ID
 */
const sendPushNotification = async (token, notification, priority = 'normal') => {
  try {
    if (!firebaseApp) {
      throw new Error('Firebase Admin not initialized');
    }

    const message = {
      token: token,
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data || {},
      android: {
        priority: priority === 'high' ? 'high' : 'normal',
        notification: {
          sound: priority === 'high' ? 'emergency_alert' : 'default',
          channelId: priority === 'high' ? 'emergency' : 'default'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: priority === 'high' ? 'emergency_alert.wav' : 'default',
            badge: 1
          }
        }
      }
    };

    const result = await admin.messaging().send(message);
    console.log(`Push notification sent successfully. Message ID: ${result}`);
    return result;

  } catch (error) {
    console.error('Push notification error:', error);
    throw new Error(`Failed to send push notification: ${error.message}`);
  }
};

/**
 * Send emergency notifications for an accident
 * @param {Object} accident - Accident document
 * @param {Object} user - User document
 * @returns {Promise<Object>} Notification results
 */
const sendEmergencyNotifications = async (accident, user) => {
  try {
    const results = {
      emergencyContacts: [],
      hospitals: [],
      emergencyServices: []
    };

    // 1. Notify emergency contacts
    if (user.emergencyContacts && user.emergencyContacts.length > 0) {
      const emergencyMessage = `EMERGENCY ALERT: ${user.firstName} ${user.lastName} has been in an accident. Location: ${accident.location.address?.formattedAddress || 'Location unavailable'}. Severity: ${accident.severity}. Time: ${accident.detectedAt.toLocaleString()}. This is an automated message from SafeRide AI.`;

      for (const contact of user.emergencyContacts) {
        try {
          const smsResult = await sendSMS(contact.phone, emergencyMessage, 'urgent');
          results.emergencyContacts.push({
            contactId: contact._id,
            name: contact.name,
            phone: contact.phone,
            status: 'sent',
            messageId: smsResult.sid,
            sentAt: new Date()
          });
        } catch (error) {
          console.error(`Failed to notify emergency contact ${contact.name}:`, error);
          results.emergencyContacts.push({
            contactId: contact._id,
            name: contact.name,
            phone: contact.phone,
            status: 'failed',
            error: error.message,
            sentAt: new Date()
          });
        }
      }
    }

    // 2. Notify nearby hospitals
    const nearbyHospitals = await Hospital.findNearby(
      accident.location.coordinates.latitude,
      accident.location.coordinates.longitude,
      50000 // 50km radius
    ).limit(5);

    const hospitalMessage = `NEW ACCIDENT ALERT - Patient: ${user.firstName} ${user.lastName}, Age: ${user.age || 'Unknown'}, Blood Type: ${user.medicalInfo?.bloodType || 'Unknown'}, Location: ${accident.location.address?.formattedAddress || 'Location unavailable'}, Severity: ${accident.severity}, Confidence: ${accident.aiAnalysis.confidenceScore}%, Time: ${accident.detectedAt.toLocaleString()}. Accident ID: ${accident.accidentId}`;

    for (const hospital of nearbyHospitals) {
      try {
        // Send SMS to hospital emergency line
        const smsResult = await sendSMS(hospital.contact.emergencyPhone, hospitalMessage, 'urgent');
        
        // Send push notifications to hospital staff
        const hospitalStaff = await User.find({
          _id: { $in: hospital.staff.map(s => s.userId) },
          'deviceInfo.fcmToken': { $exists: true, $ne: null },
          isActive: true
        });

        const pushResults = [];
        for (const staff of hospitalStaff) {
          try {
            const pushResult = await sendPushNotification(
              staff.deviceInfo.fcmToken,
              {
                title: '🚨 Emergency Accident Alert',
                body: `New ${accident.severity} accident reported. Patient: ${user.firstName} ${user.lastName}`,
                data: {
                  type: 'accident_alert',
                  accidentId: accident.accidentId,
                  severity: accident.severity,
                  hospitalId: hospital.hospitalId
                }
              },
              'high'
            );
            pushResults.push({ staffId: staff._id, messageId: pushResult, status: 'sent' });
          } catch (pushError) {
            console.error(`Failed to send push to staff ${staff._id}:`, pushError);
            pushResults.push({ staffId: staff._id, status: 'failed', error: pushError.message });
          }
        }

        results.hospitals.push({
          hospitalId: hospital._id,
          name: hospital.name,
          smsResult: { messageId: smsResult.sid, status: 'sent' },
          pushResults,
          sentAt: new Date()
        });

      } catch (error) {
        console.error(`Failed to notify hospital ${hospital.name}:`, error);
        results.hospitals.push({
          hospitalId: hospital._id,
          name: hospital.name,
          status: 'failed',
          error: error.message,
          sentAt: new Date()
        });
      }
    }

    // 3. Notify emergency services (911, police, ambulance)
    const emergencyNumbers = [
      process.env.EMERGENCY_POLICE || '911',
      process.env.EMERGENCY_AMBULANCE || '911'
    ];

    const emergencyServiceMessage = `AUTOMATED ACCIDENT REPORT - Location: ${accident.location.coordinates.latitude}, ${accident.location.coordinates.longitude} (${accident.location.address?.formattedAddress || 'Address lookup failed'}). Severity: ${accident.severity}. Patient: ${user.firstName} ${user.lastName}, Phone: ${user.phone}. Medical Info: Blood Type: ${user.medicalInfo?.bloodType || 'Unknown'}, Allergies: ${user.medicalInfo?.allergies?.join(', ') || 'None listed'}. Time: ${accident.detectedAt.toLocaleString()}. Confidence: ${accident.aiAnalysis.confidenceScore}%. Accident ID: ${accident.accidentId}`;

    for (const number of emergencyNumbers) {
      try {
        const smsResult = await sendSMS(number, emergencyServiceMessage, 'urgent');
        results.emergencyServices.push({
          serviceType: number.includes('police') ? 'police' : 'ambulance',
          contactNumber: number,
          messageId: smsResult.sid,
          status: 'sent',
          sentAt: new Date()
        });
      } catch (error) {
        console.error(`Failed to notify emergency service ${number}:`, error);
        results.emergencyServices.push({
          serviceType: number.includes('police') ? 'police' : 'ambulance',
          contactNumber: number,
          status: 'failed',
          error: error.message,
          sentAt: new Date()
        });
      }
    }

    // Update accident with notification results
    accident.notifications = results;
    await accident.save();

    console.log(`Emergency notifications sent for accident ${accident.accidentId}`);
    return results;

  } catch (error) {
    console.error('Emergency notification error:', error);
    throw new Error(`Failed to send emergency notifications: ${error.message}`);
  }
};

/**
 * Send notification to user about accident status update
 * @param {string} userId - User ID
 * @param {string} accidentId - Accident ID
 * @param {string} status - New status
 * @param {string} message - Custom message
 * @returns {Promise<Object>} Notification result
 */
const notifyAccidentStatusUpdate = async (userId, accidentId, status, message) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const results = {};

    // Send SMS if enabled
    if (user.settings.enableSMSAlerts) {
      try {
        const smsMessage = message || `SafeRide AI Update: Your accident report ${accidentId} status has been updated to: ${status}. Time: ${new Date().toLocaleString()}`;
        const smsResult = await sendSMS(user.phone, smsMessage, 'normal');
        results.sms = { messageId: smsResult.sid, status: 'sent' };
      } catch (smsError) {
        console.error('SMS status update error:', smsError);
        results.sms = { status: 'failed', error: smsError.message };
      }
    }

    // Send push notification if enabled and token available
    if (user.settings.enablePushNotifications && user.deviceInfo?.fcmToken) {
      try {
        const pushResult = await sendPushNotification(
          user.deviceInfo.fcmToken,
          {
            title: 'Accident Status Update',
            body: message || `Your accident report status has been updated to: ${status}`,
            data: {
              type: 'status_update',
              accidentId,
              status
            }
          },
          'normal'
        );
        results.push = { messageId: pushResult, status: 'sent' };
      } catch (pushError) {
        console.error('Push status update error:', pushError);
        results.push = { status: 'failed', error: pushError.message };
      }
    }

    return results;

  } catch (error) {
    console.error('Status update notification error:', error);
    throw new Error(`Failed to send status update notification: ${error.message}`);
  }
};

/**
 * Send bulk notifications to multiple users
 * @param {Array} userIds - Array of user IDs
 * @param {Object} notification - Notification payload
 * @param {Array} channels - Notification channels (sms, push, email)
 * @returns {Promise<Object>} Bulk notification results
 */
const sendBulkNotifications = async (userIds, notification, channels = ['push']) => {
  try {
    const users = await User.find({
      _id: { $in: userIds },
      isActive: true
    });

    const results = {
      total: users.length,
      successful: 0,
      failed: 0,
      details: []
    };

    for (const user of users) {
      const userResult = { userId: user._id, channels: {} };

      for (const channel of channels) {
        try {
          switch (channel) {
            case 'sms':
              if (user.settings.enableSMSAlerts) {
                const smsResult = await sendSMS(user.phone, notification.message, notification.priority || 'normal');
                userResult.channels.sms = { status: 'sent', messageId: smsResult.sid };
              } else {
                userResult.channels.sms = { status: 'skipped', reason: 'SMS disabled' };
              }
              break;

            case 'push':
              if (user.settings.enablePushNotifications && user.deviceInfo?.fcmToken) {
                const pushResult = await sendPushNotification(
                  user.deviceInfo.fcmToken,
                  {
                    title: notification.title,
                    body: notification.body || notification.message,
                    data: notification.data || {}
                  },
                  notification.priority || 'normal'
                );
                userResult.channels.push = { status: 'sent', messageId: pushResult };
              } else {
                userResult.channels.push = { status: 'skipped', reason: 'Push disabled or no token' };
              }
              break;

            default:
              userResult.channels[channel] = { status: 'unsupported' };
          }
        } catch (channelError) {
          console.error(`Bulk notification ${channel} error for user ${user._id}:`, channelError);
          userResult.channels[channel] = { status: 'failed', error: channelError.message };
        }
      }

      // Determine if user notification was successful
      const hasSuccessfulChannel = Object.values(userResult.channels).some(c => c.status === 'sent');
      if (hasSuccessfulChannel) {
        results.successful++;
      } else {
        results.failed++;
      }

      results.details.push(userResult);
    }

    return results;

  } catch (error) {
    console.error('Bulk notification error:', error);
    throw new Error(`Failed to send bulk notifications: ${error.message}`);
  }
};

module.exports = {
  sendSMS,
  sendPushNotification,
  sendEmergencyNotifications,
  notifyAccidentStatusUpdate,
  sendBulkNotifications
};
