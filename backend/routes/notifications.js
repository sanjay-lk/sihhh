const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { sendSMS, sendPushNotification } = require('../services/notificationService');
const { authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/notifications/sms
// @desc    Send SMS notification
// @access  Private (Hospital staff and admin only)
router.post('/sms', authorize('hospital', 'emergency_responder', 'admin'), [
  body('to')
    .isMobilePhone()
    .withMessage('Invalid phone number'),
  body('message')
    .isLength({ min: 1, max: 1600 })
    .withMessage('Message must be between 1 and 1600 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority level')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { to, message, priority = 'normal' } = req.body;

    try {
      const result = await sendSMS(to, message, priority);
      
      res.json({
        success: true,
        message: 'SMS sent successfully',
        data: {
          messageId: result.sid,
          to,
          status: result.status,
          sentAt: new Date()
        }
      });

    } catch (smsError) {
      console.error('SMS sending error:', smsError);
      res.status(500).json({
        success: false,
        error: 'Failed to send SMS',
        message: smsError.message || 'SMS service error'
      });
    }

  } catch (error) {
    console.error('SMS notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send SMS notification',
      message: 'An error occurred while sending SMS'
    });
  }
});

// @route   POST /api/notifications/push
// @desc    Send push notification
// @access  Private (Hospital staff and admin only)
router.post('/push', authorize('hospital', 'emergency_responder', 'admin'), [
  body('tokens')
    .isArray({ min: 1 })
    .withMessage('At least one FCM token is required'),
  body('title')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('body')
    .isLength({ min: 1, max: 500 })
    .withMessage('Body must be between 1 and 500 characters'),
  body('data')
    .optional()
    .isObject()
    .withMessage('Data must be an object'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high'])
    .withMessage('Invalid priority level')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { tokens, title, body, data = {}, priority = 'normal' } = req.body;

    try {
      const results = await Promise.allSettled(
        tokens.map(token => sendPushNotification(token, { title, body, data }, priority))
      );

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      res.json({
        success: true,
        message: 'Push notifications processed',
        data: {
          total: tokens.length,
          successful,
          failed,
          sentAt: new Date()
        }
      });

    } catch (pushError) {
      console.error('Push notification error:', pushError);
      res.status(500).json({
        success: false,
        error: 'Failed to send push notifications',
        message: pushError.message || 'Push notification service error'
      });
    }

  } catch (error) {
    console.error('Push notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send push notification',
      message: 'An error occurred while sending push notification'
    });
  }
});

// @route   POST /api/notifications/emergency-broadcast
// @desc    Send emergency broadcast to multiple channels
// @access  Private (Admin only)
router.post('/emergency-broadcast', authorize('admin'), [
  body('message')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('channels')
    .isArray({ min: 1 })
    .withMessage('At least one channel is required'),
  body('channels.*')
    .isIn(['sms', 'push', 'email'])
    .withMessage('Invalid notification channel'),
  body('recipients')
    .isArray({ min: 1 })
    .withMessage('At least one recipient is required'),
  body('severity')
    .isIn(['info', 'warning', 'critical', 'emergency'])
    .withMessage('Invalid severity level')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { message, channels, recipients, severity, title = 'Emergency Alert' } = req.body;

    const results = {
      sms: { sent: 0, failed: 0 },
      push: { sent: 0, failed: 0 },
      email: { sent: 0, failed: 0 }
    };

    // Process each channel
    for (const channel of channels) {
      switch (channel) {
        case 'sms':
          for (const recipient of recipients) {
            if (recipient.phone) {
              try {
                await sendSMS(recipient.phone, message, 'urgent');
                results.sms.sent++;
              } catch (error) {
                console.error(`SMS failed for ${recipient.phone}:`, error);
                results.sms.failed++;
              }
            }
          }
          break;

        case 'push':
          const tokens = recipients
            .filter(r => r.fcmToken)
            .map(r => r.fcmToken);
          
          if (tokens.length > 0) {
            try {
              const pushResults = await Promise.allSettled(
                tokens.map(token => sendPushNotification(token, { title, body: message }, 'high'))
              );
              
              results.push.sent = pushResults.filter(r => r.status === 'fulfilled').length;
              results.push.failed = pushResults.filter(r => r.status === 'rejected').length;
            } catch (error) {
              console.error('Broadcast push notification error:', error);
              results.push.failed = tokens.length;
            }
          }
          break;

        case 'email':
          // TODO: Implement email notifications
          console.log('Email notifications not yet implemented');
          break;
      }
    }

    // Emit real-time broadcast event
    const io = req.app.get('io');
    io.emit('emergency_broadcast', {
      message,
      severity,
      channels,
      timestamp: new Date(),
      sentBy: req.user._id
    });

    res.json({
      success: true,
      message: 'Emergency broadcast sent',
      data: {
        results,
        totalRecipients: recipients.length,
        channels,
        severity,
        sentAt: new Date()
      }
    });

  } catch (error) {
    console.error('Emergency broadcast error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send emergency broadcast',
      message: 'An error occurred while sending emergency broadcast'
    });
  }
});

// @route   GET /api/notifications/history
// @desc    Get notification history
// @access  Private (Admin only)
router.get('/history', authorize('admin'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('type').optional().isIn(['sms', 'push', 'email']).withMessage('Invalid notification type'),
  query('status').optional().isIn(['sent', 'delivered', 'failed']).withMessage('Invalid status'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // This would typically query a notifications log collection
    // For now, return a placeholder response
    res.json({
      success: true,
      message: 'Notification history endpoint - implementation pending',
      data: {
        notifications: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0
        }
      }
    });

  } catch (error) {
    console.error('Get notification history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get notification history',
      message: 'An error occurred while fetching notification history'
    });
  }
});

// @route   POST /api/notifications/test
// @desc    Test notification services
// @access  Private (Admin only)
router.post('/test', authorize('admin'), [
  body('type')
    .isIn(['sms', 'push'])
    .withMessage('Invalid notification type'),
  body('recipient')
    .notEmpty()
    .withMessage('Recipient is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { type, recipient } = req.body;
    const testMessage = `SafeRide AI Test Notification - ${new Date().toISOString()}`;

    let result;

    try {
      switch (type) {
        case 'sms':
          result = await sendSMS(recipient, testMessage, 'normal');
          break;
        
        case 'push':
          result = await sendPushNotification(recipient, {
            title: 'SafeRide AI Test',
            body: testMessage
          }, 'normal');
          break;
        
        default:
          throw new Error('Invalid notification type');
      }

      res.json({
        success: true,
        message: `Test ${type} notification sent successfully`,
        data: {
          type,
          recipient,
          result,
          sentAt: new Date()
        }
      });

    } catch (testError) {
      console.error(`Test ${type} notification error:`, testError);
      res.status(500).json({
        success: false,
        error: `Failed to send test ${type} notification`,
        message: testError.message
      });
    }

  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test notification',
      message: 'An error occurred while testing notification'
    });
  }
});

// @route   GET /api/notifications/status
// @desc    Get notification service status
// @access  Private (Admin only)
router.get('/status', authorize('admin'), async (req, res) => {
  try {
    // Check service status
    const status = {
      sms: {
        service: 'Twilio',
        status: 'operational', // This would be checked dynamically
        lastChecked: new Date()
      },
      push: {
        service: 'Firebase Cloud Messaging',
        status: 'operational', // This would be checked dynamically
        lastChecked: new Date()
      },
      email: {
        service: 'Not Configured',
        status: 'disabled',
        lastChecked: new Date()
      }
    };

    // TODO: Implement actual service health checks
    
    res.json({
      success: true,
      data: {
        services: status,
        overall: 'operational',
        lastUpdated: new Date()
      }
    });

  } catch (error) {
    console.error('Get notification status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get notification status',
      message: 'An error occurred while checking notification service status'
    });
  }
});

module.exports = router;
