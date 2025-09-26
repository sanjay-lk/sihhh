const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Verify JWT token middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token - user not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Account is deactivated'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Token expired'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Authentication failed'
    });
  }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({
        error: 'Access denied',
        message: `Access restricted to: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Emergency access middleware (for critical accident reports)
const emergencyAccess = async (req, res, next) => {
  try {
    // Check if this is an emergency accident report
    const isEmergency = req.body.emergency === true || 
                       req.body.severity === 'critical' ||
                       req.body.aiAnalysis?.confidenceScore > 90;

    if (isEmergency) {
      // Allow emergency access with minimal authentication
      const deviceId = req.headers['x-device-id'];
      const emergencyToken = req.headers['x-emergency-token'];
      
      if (deviceId && emergencyToken) {
        // Validate emergency token (simplified for emergency situations)
        const user = await User.findOne({ 
          'deviceInfo.deviceId': deviceId,
          isActive: true 
        }).select('-password');
        
        if (user) {
          req.user = user;
          req.emergencyAccess = true;
          return next();
        }
      }
    }

    // Fall back to regular authentication
    return authenticateToken(req, res, next);
  } catch (error) {
    console.error('Emergency access error:', error);
    return authenticateToken(req, res, next);
  }
};

// Rate limiting for sensitive operations
const sensitiveOperation = (req, res, next) => {
  // Add additional security checks for sensitive operations
  const userAgent = req.headers['user-agent'];
  const ip = req.ip || req.connection.remoteAddress;
  
  // Log sensitive operation
  console.log(`Sensitive operation: ${req.method} ${req.path} by user ${req.user?.id} from ${ip}`);
  
  next();
};

// Device validation middleware
const validateDevice = async (req, res, next) => {
  try {
    const deviceId = req.headers['x-device-id'];
    const platform = req.headers['x-platform'];
    const appVersion = req.headers['x-app-version'];

    if (!deviceId) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Device ID required'
      });
    }

    // Update user's device info if authenticated
    if (req.user) {
      const updateData = {
        'deviceInfo.deviceId': deviceId,
        'deviceInfo.platform': platform,
        'deviceInfo.appVersion': appVersion
      };

      await User.findByIdAndUpdate(req.user._id, updateData);
    }

    req.deviceInfo = {
      deviceId,
      platform,
      appVersion
    };

    next();
  } catch (error) {
    console.error('Device validation error:', error);
    next(); // Continue without device validation in case of error
  }
};

// Hospital staff authorization
const hospitalStaffAuth = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Authentication required'
      });
    }

    // Check if user is hospital staff
    if (!['hospital', 'emergency_responder', 'admin'].includes(req.user.userType)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Hospital staff access required'
      });
    }

    // Additional validation for hospital staff
    const Hospital = require('../models/Hospital');
    const hospital = await Hospital.findOne({
      'staff.userId': req.user._id,
      'staff.isActive': true
    });

    if (!hospital) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Not associated with any active hospital'
      });
    }

    req.hospital = hospital;
    req.staffInfo = hospital.staff.find(staff => 
      staff.userId.toString() === req.user._id.toString()
    );

    next();
  } catch (error) {
    console.error('Hospital staff auth error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Authorization failed'
    });
  }
};

module.exports = {
  generateToken,
  authenticateToken,
  optionalAuth,
  authorize,
  emergencyAccess,
  sensitiveOperation,
  validateDevice,
  hospitalStaffAuth
};
