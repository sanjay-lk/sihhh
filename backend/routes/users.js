const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const Accident = require('../models/Accident');
const { authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get users (admin only)
// @access  Private (Admin only)
router.get('/', authorize('admin'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('userType').optional().isIn(['driver', 'hospital', 'emergency_responder', 'admin']).withMessage('Invalid user type'),
  query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  query('search').optional().isString().withMessage('Search must be a string')
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
      userType,
      isActive,
      search
    } = req.query;

    // Build query
    let query = {};

    if (userType) {
      query.userType = userType;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -resetPasswordToken -verificationToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get users',
      message: 'An error occurred while fetching users'
    });
  }
});

// @route   GET /api/users/:userId
// @desc    Get specific user details
// @access  Private (Admin or self)
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Check permissions
    if (req.user.userType !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only view your own profile'
      });
    }

    const user = await User.findById(userId).select('-password -resetPasswordToken -verificationToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'No user found with the provided ID'
      });
    }

    res.json({
      success: true,
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user',
      message: 'An error occurred while fetching user details'
    });
  }
});

// @route   PUT /api/users/:userId/status
// @desc    Update user status (activate/deactivate)
// @access  Private (Admin only)
router.put('/:userId/status', authorize('admin'), [
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('reason')
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage('Reason must be between 1 and 500 characters')
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

    const { userId } = req.params;
    const { isActive, reason } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'No user found with the provided ID'
      });
    }

    // Prevent admin from deactivating themselves
    if (req.user._id.toString() === userId && !isActive) {
      return res.status(400).json({
        success: false,
        error: 'Invalid operation',
        message: 'You cannot deactivate your own account'
      });
    }

    user.isActive = isActive;
    await user.save();

    // Log the action
    console.log(`User ${userId} ${isActive ? 'activated' : 'deactivated'} by admin ${req.user._id}. Reason: ${reason || 'Not provided'}`);

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        userId: user._id,
        isActive: user.isActive,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user status',
      message: 'An error occurred while updating user status'
    });
  }
});

// @route   GET /api/users/:userId/accidents
// @desc    Get user's accident history
// @access  Private (Admin or self)
router.get('/:userId/accidents', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['detected', 'confirmed', 'false_alarm', 'responded', 'resolved']),
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

    const { userId } = req.params;

    // Check permissions
    if (req.user.userType !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only view your own accident history'
      });
    }

    const {
      page = 1,
      limit = 20,
      status,
      startDate,
      endDate
    } = req.query;

    // Build query
    let query = { userId };

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.detectedAt = {};
      if (startDate) query.detectedAt.$gte = new Date(startDate);
      if (endDate) query.detectedAt.$lte = new Date(endDate);
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [accidents, total] = await Promise.all([
      Accident.find(query)
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
    console.error('Get user accidents error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user accidents',
      message: 'An error occurred while fetching user accident history'
    });
  }
});

// @route   PUT /api/users/:userId/emergency-contacts
// @desc    Update user's emergency contacts
// @access  Private (Self only)
router.put('/:userId/emergency-contacts', [
  body('emergencyContacts')
    .isArray({ min: 1, max: 5 })
    .withMessage('Must provide 1-5 emergency contacts'),
  body('emergencyContacts.*.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Contact name must be between 2 and 100 characters'),
  body('emergencyContacts.*.phone')
    .isMobilePhone()
    .withMessage('Invalid phone number'),
  body('emergencyContacts.*.relationship')
    .isIn(['family', 'friend', 'colleague', 'other'])
    .withMessage('Invalid relationship type')
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

    const { userId } = req.params;
    const { emergencyContacts } = req.body;

    // Check permissions
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only update your own emergency contacts'
      });
    }

    // Ensure only one primary contact
    let primaryCount = 0;
    emergencyContacts.forEach(contact => {
      if (contact.isPrimary) primaryCount++;
    });

    if (primaryCount !== 1) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Exactly one emergency contact must be marked as primary'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { emergencyContacts },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Emergency contacts updated successfully',
      data: {
        emergencyContacts: user.emergencyContacts
      }
    });

  } catch (error) {
    console.error('Update emergency contacts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update emergency contacts',
      message: 'An error occurred while updating emergency contacts'
    });
  }
});

// @route   PUT /api/users/:userId/medical-info
// @desc    Update user's medical information
// @access  Private (Self only)
router.put('/:userId/medical-info', [
  body('medicalInfo.bloodType')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood type'),
  body('medicalInfo.allergies')
    .optional()
    .isArray()
    .withMessage('Allergies must be an array'),
  body('medicalInfo.medications')
    .optional()
    .isArray()
    .withMessage('Medications must be an array'),
  body('medicalInfo.medicalConditions')
    .optional()
    .isArray()
    .withMessage('Medical conditions must be an array'),
  body('medicalInfo.emergencyMedicalInfo')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Emergency medical info must be less than 1000 characters')
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

    const { userId } = req.params;
    const { medicalInfo } = req.body;

    // Check permissions
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only update your own medical information'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { medicalInfo },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Medical information updated successfully',
      data: {
        medicalInfo: user.medicalInfo
      }
    });

  } catch (error) {
    console.error('Update medical info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update medical information',
      message: 'An error occurred while updating medical information'
    });
  }
});

// @route   PUT /api/users/:userId/settings
// @desc    Update user's app settings
// @access  Private (Self only)
router.put('/:userId/settings', [
  body('settings.enableAutoDetection')
    .optional()
    .isBoolean()
    .withMessage('enableAutoDetection must be a boolean'),
  body('settings.enableLocationSharing')
    .optional()
    .isBoolean()
    .withMessage('enableLocationSharing must be a boolean'),
  body('settings.enableSMSAlerts')
    .optional()
    .isBoolean()
    .withMessage('enableSMSAlerts must be a boolean'),
  body('settings.enablePushNotifications')
    .optional()
    .isBoolean()
    .withMessage('enablePushNotifications must be a boolean'),
  body('settings.sensitivityLevel')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid sensitivity level'),
  body('settings.language')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Invalid language code')
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

    const { userId } = req.params;
    const { settings } = req.body;

    // Check permissions
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only update your own settings'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { 'settings': { ...req.user.settings, ...settings } } },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        settings: user.settings
      }
    });

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update settings',
      message: 'An error occurred while updating settings'
    });
  }
});

// @route   GET /api/users/statistics/overview
// @desc    Get user statistics overview
// @access  Private (Admin only)
router.get('/statistics/overview', authorize('admin'), async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      driverUsers,
      hospitalUsers,
      recentRegistrations
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ userType: 'driver', isActive: true }),
      User.countDocuments({ userType: 'hospital', isActive: true }),
      User.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('firstName lastName email userType createdAt')
    ]);

    const userTypeBreakdown = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$userType', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          inactiveUsers: totalUsers - activeUsers,
          driverUsers,
          hospitalUsers
        },
        userTypeBreakdown,
        recentRegistrations
      }
    });

  } catch (error) {
    console.error('Get user statistics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user statistics',
      message: 'An error occurred while fetching user statistics'
    });
  }
});

// @route   POST /api/users/:userId/device-token
// @desc    Update user's FCM device token for push notifications
// @access  Private (Self only)
router.post('/:userId/device-token', [
  body('fcmToken')
    .notEmpty()
    .withMessage('FCM token is required'),
  body('platform')
    .optional()
    .isIn(['ios', 'android', 'web'])
    .withMessage('Invalid platform')
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

    const { userId } = req.params;
    const { fcmToken, platform } = req.body;

    // Check permissions
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only update your own device token'
      });
    }

    const updateData = {
      'deviceInfo.fcmToken': fcmToken
    };

    if (platform) {
      updateData['deviceInfo.platform'] = platform;
    }

    await User.findByIdAndUpdate(userId, updateData);

    res.json({
      success: true,
      message: 'Device token updated successfully'
    });

  } catch (error) {
    console.error('Update device token error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update device token',
      message: 'An error occurred while updating device token'
    });
  }
});

module.exports = router;
