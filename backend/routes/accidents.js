const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Accident = require('../models/Accident');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const { authenticateToken, emergencyAccess, validateDevice } = require('../middleware/auth');
const { sendEmergencyNotifications } = require('../services/notificationService');
const { analyzeAccidentData } = require('../services/aiService');
const { getAddressFromCoordinates } = require('../services/geocodingService');

const router = express.Router();

// Validation middleware
const validateAccidentReport = [
  body('location.coordinates.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  body('location.coordinates.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  body('sensorData')
    .isArray({ min: 1 })
    .withMessage('Sensor data is required'),
  body('sensorData.*.accelerometer.x')
    .isNumeric()
    .withMessage('Invalid accelerometer X value'),
  body('sensorData.*.accelerometer.y')
    .isNumeric()
    .withMessage('Invalid accelerometer Y value'),
  body('sensorData.*.accelerometer.z')
    .isNumeric()
    .withMessage('Invalid accelerometer Z value'),
  body('sensorData.*.gyroscope.x')
    .isNumeric()
    .withMessage('Invalid gyroscope X value'),
  body('sensorData.*.gyroscope.y')
    .isNumeric()
    .withMessage('Invalid gyroscope Y value'),
  body('sensorData.*.gyroscope.z')
    .isNumeric()
    .withMessage('Invalid gyroscope Z value'),
  body('sensorData.*.speed')
    .isFloat({ min: 0 })
    .withMessage('Invalid speed value')
];

// @route   POST /api/accidents/report
// @desc    Report a new accident (automatic or manual)
// @access  Private (with emergency access)
router.post('/report', emergencyAccess, validateDevice, validateAccidentReport, async (req, res) => {
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

    const {
      location,
      sensorData,
      description,
      detectionMethod = 'automatic',
      userConfirmed = false,
      images = [],
      audioRecording,
      injuries = [],
      consciousness = 'unknown'
    } = req.body;

    // Calculate sensor data magnitude and features
    const processedSensorData = sensorData.map(data => ({
      ...data,
      accelerometer: {
        ...data.accelerometer,
        magnitude: Math.sqrt(
          Math.pow(data.accelerometer.x, 2) +
          Math.pow(data.accelerometer.y, 2) +
          Math.pow(data.accelerometer.z, 2)
        )
      },
      timestamp: new Date(data.timestamp || Date.now())
    }));

    // AI Analysis
    const startTime = Date.now();
    const aiAnalysis = await analyzeAccidentData(processedSensorData);
    const processingTime = Date.now() - startTime;

    // Get address from coordinates
    let addressInfo = {};
    try {
      addressInfo = await getAddressFromCoordinates(
        location.coordinates.latitude,
        location.coordinates.longitude
      );
    } catch (error) {
      console.error('Geocoding error:', error);
    }

    // Create accident record
    const accident = new Accident({
      userId: req.user._id,
      location: {
        coordinates: location.coordinates,
        address: addressInfo,
        accuracy: location.accuracy,
        timestamp: new Date()
      },
      sensorData: processedSensorData,
      aiAnalysis: {
        ...aiAnalysis,
        processingTime,
        detectionMethod
      },
      severity: aiAnalysis.severityLevel,
      description,
      userConfirmed,
      images,
      audioRecording,
      injuries,
      consciousness,
      deviceInfo: req.deviceInfo,
      detectedAt: new Date()
    });

    await accident.save();

    // Emit real-time event to connected clients
    const io = req.app.get('io');
    io.emit('accident_detected', {
      accidentId: accident.accidentId,
      userId: accident.userId,
      location: accident.location,
      severity: accident.severity,
      confidence: accident.aiAnalysis.confidenceScore,
      timestamp: accident.detectedAt
    });

    // Send emergency notifications if confidence is high enough
    if (aiAnalysis.confidenceScore >= 70 || userConfirmed) {
      try {
        await sendEmergencyNotifications(accident, req.user);
        
        // Update accident status
        accident.status = 'confirmed';
        accident.confirmedAt = new Date();
        await accident.save();

        // Emit confirmation event
        io.emit('accident_confirmed', {
          accidentId: accident.accidentId,
          status: 'confirmed'
        });

      } catch (notificationError) {
        console.error('Notification error:', notificationError);
        // Continue even if notifications fail
      }
    }

    res.status(201).json({
      success: true,
      message: 'Accident reported successfully',
      data: {
        accident: {
          accidentId: accident.accidentId,
          status: accident.status,
          severity: accident.severity,
          confidence: accident.aiAnalysis.confidenceScore,
          location: accident.location,
          detectedAt: accident.detectedAt
        }
      }
    });

  } catch (error) {
    console.error('Accident report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to report accident',
      message: 'An error occurred while reporting the accident'
    });
  }
});

// @route   GET /api/accidents
// @desc    Get accidents (with filters)
// @access  Private
router.get('/', authenticateToken, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['detected', 'confirmed', 'false_alarm', 'responded', 'resolved']),
  query('severity').optional().isIn(['minor', 'moderate', 'severe', 'critical']),
  query('userId').optional().isMongoId().withMessage('Invalid user ID'),
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

    const {
      page = 1,
      limit = 20,
      status,
      severity,
      userId,
      startDate,
      endDate,
      latitude,
      longitude,
      radius = 50000 // 50km default
    } = req.query;

    // Build query
    let query = {};

    // User-specific filtering
    if (req.user.userType === 'driver') {
      query.userId = req.user._id;
    } else if (userId) {
      query.userId = userId;
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Severity filter
    if (severity) {
      query.severity = severity;
    }

    // Date range filter
    if (startDate || endDate) {
      query.detectedAt = {};
      if (startDate) query.detectedAt.$gte = new Date(startDate);
      if (endDate) query.detectedAt.$lte = new Date(endDate);
    }

    // Location-based filter
    if (latitude && longitude) {
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(radius)
        }
      };
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [accidents, total] = await Promise.all([
      Accident.find(query)
        .populate('userId', 'firstName lastName phone')
        .sort({ detectedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Accident.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        accidents,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get accidents error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get accidents',
      message: 'An error occurred while fetching accidents'
    });
  }
});

// @route   GET /api/accidents/:accidentId
// @desc    Get specific accident details
// @access  Private
router.get('/:accidentId', authenticateToken, async (req, res) => {
  try {
    const { accidentId } = req.params;

    const accident = await Accident.findOne({ accidentId })
      .populate('userId', 'firstName lastName phone email medicalInfo emergencyContacts')
      .populate('responses.hospitalId', 'name contact address')
      .populate('responses.responderId', 'firstName lastName');

    if (!accident) {
      return res.status(404).json({
        success: false,
        error: 'Accident not found',
        message: 'No accident found with the provided ID'
      });
    }

    // Check access permissions
    if (req.user.userType === 'driver' && accident.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only view your own accidents'
      });
    }

    res.json({
      success: true,
      data: {
        accident
      }
    });

  } catch (error) {
    console.error('Get accident error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get accident',
      message: 'An error occurred while fetching accident details'
    });
  }
});

// @route   PUT /api/accidents/:accidentId/status
// @desc    Update accident status
// @access  Private
router.put('/:accidentId/status', authenticateToken, [
  body('status')
    .isIn(['detected', 'confirmed', 'false_alarm', 'responded', 'resolved'])
    .withMessage('Invalid status'),
  body('falseAlarmReason')
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage('False alarm reason must be between 1 and 500 characters')
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

    const { accidentId } = req.params;
    const { status, falseAlarmReason } = req.body;

    const accident = await Accident.findOne({ accidentId });

    if (!accident) {
      return res.status(404).json({
        success: false,
        error: 'Accident not found',
        message: 'No accident found with the provided ID'
      });
    }

    // Check permissions
    const canUpdate = 
      req.user._id.toString() === accident.userId.toString() || // Owner
      ['hospital', 'emergency_responder', 'admin'].includes(req.user.userType); // Staff

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You do not have permission to update this accident'
      });
    }

    // Update status
    await accident.updateStatus(status, req.user._id);

    // Handle false alarm
    if (status === 'false_alarm' && falseAlarmReason) {
      accident.falseAlarmReason = falseAlarmReason;
      await accident.save();
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('accident_updated', {
      accidentId: accident.accidentId,
      status: accident.status,
      updatedBy: req.user._id,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Accident status updated successfully',
      data: {
        accident: {
          accidentId: accident.accidentId,
          status: accident.status,
          updatedAt: accident.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Update accident status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update accident status',
      message: 'An error occurred while updating accident status'
    });
  }
});

// @route   POST /api/accidents/:accidentId/response
// @desc    Add emergency response to accident
// @access  Private (Hospital staff only)
router.post('/:accidentId/response', authenticateToken, [
  body('responseType')
    .isIn(['ambulance', 'police', 'fire', 'medical_helicopter'])
    .withMessage('Invalid response type'),
  body('estimatedArrival')
    .optional()
    .isISO8601()
    .withMessage('Invalid estimated arrival time'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters')
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

    // Check if user is authorized to dispatch response
    if (!['hospital', 'emergency_responder', 'admin'].includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'Only hospital staff can dispatch emergency response'
      });
    }

    const { accidentId } = req.params;
    const { responseType, estimatedArrival, notes } = req.body;

    const accident = await Accident.findOne({ accidentId });

    if (!accident) {
      return res.status(404).json({
        success: false,
        error: 'Accident not found',
        message: 'No accident found with the provided ID'
      });
    }

    // Find hospital associated with the user
    const hospital = await Hospital.findOne({
      'staff.userId': req.user._id,
      'staff.isActive': true
    });

    if (!hospital) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'User not associated with any hospital'
      });
    }

    // Add response
    const responseData = {
      hospitalId: hospital._id,
      responderId: req.user._id,
      responseType,
      estimatedArrival: estimatedArrival ? new Date(estimatedArrival) : undefined,
      notes
    };

    await accident.addResponse(responseData);

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('emergency_response_dispatched', {
      accidentId: accident.accidentId,
      responseType,
      hospitalName: hospital.name,
      estimatedArrival,
      timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Emergency response dispatched successfully',
      data: {
        accidentId: accident.accidentId,
        responseType,
        hospitalName: hospital.name,
        estimatedArrival
      }
    });

  } catch (error) {
    console.error('Add response error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to dispatch response',
      message: 'An error occurred while dispatching emergency response'
    });
  }
});

// @route   GET /api/accidents/statistics/summary
// @desc    Get accident statistics summary
// @access  Private (Hospital staff and admin only)
router.get('/statistics/summary', authenticateToken, [
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  query('groupBy').optional().isIn(['day', 'week', 'month']).withMessage('Invalid groupBy value')
], async (req, res) => {
  try {
    // Check permissions
    if (!['hospital', 'emergency_responder', 'admin'].includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'Only authorized personnel can view statistics'
      });
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate = new Date(),
      groupBy = 'day'
    } = req.query;

    const statistics = await Accident.getStatistics(new Date(startDate), new Date(endDate));

    // Get recent accidents
    const recentAccidents = await Accident.findRecent(24)
      .populate('userId', 'firstName lastName')
      .limit(10);

    res.json({
      success: true,
      data: {
        statistics: statistics[0] || {
          totalAccidents: 0,
          confirmedAccidents: 0,
          falseAlarms: 0,
          avgResponseTime: 0,
          severityBreakdown: []
        },
        recentAccidents,
        dateRange: {
          startDate,
          endDate
        }
      }
    });

  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics',
      message: 'An error occurred while fetching statistics'
    });
  }
});

// @route   POST /api/accidents/:accidentId/feedback
// @desc    Submit feedback for accident response
// @access  Private
router.post('/:accidentId/feedback', authenticateToken, [
  body('feedbackScore')
    .isInt({ min: 1, max: 5 })
    .withMessage('Feedback score must be between 1 and 5'),
  body('feedbackComments')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Feedback comments must be less than 1000 characters')
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

    const { accidentId } = req.params;
    const { feedbackScore, feedbackComments } = req.body;

    const accident = await Accident.findOne({ accidentId });

    if (!accident) {
      return res.status(404).json({
        success: false,
        error: 'Accident not found',
        message: 'No accident found with the provided ID'
      });
    }

    // Check if user is the accident owner
    if (accident.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only provide feedback for your own accidents'
      });
    }

    // Update feedback
    accident.feedbackScore = feedbackScore;
    accident.feedbackComments = feedbackComments;
    await accident.save();

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        accidentId: accident.accidentId,
        feedbackScore,
        feedbackComments
      }
    });

  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback',
      message: 'An error occurred while submitting feedback'
    });
  }
});

module.exports = router;
