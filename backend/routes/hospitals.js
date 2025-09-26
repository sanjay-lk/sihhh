const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Hospital = require('../models/Hospital');
const { authenticateToken, hospitalStaffAuth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/hospitals
// @desc    Get hospitals (with filters and search)
// @access  Public (for emergency services)
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  query('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  query('radius').optional().isInt({ min: 1 }).withMessage('Radius must be a positive integer'),
  query('specialty').optional().isString().withMessage('Invalid specialty'),
  query('status').optional().isIn(['operational', 'limited', 'emergency_only', 'closed']).withMessage('Invalid status')
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
      latitude,
      longitude,
      radius = 50000, // 50km default
      specialty,
      status = 'operational',
      search,
      bedType,
      minBeds = 1
    } = req.query;

    let query = {
      isActive: true,
      status: { $in: ['operational', 'limited'] }
    };

    // Status filter
    if (status !== 'operational') {
      query.status = status;
    }

    // Search by name or address
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { 'address.state': { $regex: search, $options: 'i' } }
      ];
    }

    // Specialty filter
    if (specialty) {
      query.specialties = specialty;
    }

    // Bed availability filter
    if (bedType && minBeds) {
      switch (bedType) {
        case 'icu':
          query['capacity.icuBeds.available'] = { $gte: parseInt(minBeds) };
          break;
        case 'emergency':
          query['capacity.emergencyBeds.available'] = { $gte: parseInt(minBeds) };
          break;
        default:
          query['capacity.availableBeds'] = { $gte: parseInt(minBeds) };
      }
    }

    let hospitals;
    let total;

    // Location-based search
    if (latitude && longitude) {
      const specialties = specialty ? [specialty] : [];
      hospitals = await Hospital.findNearby(
        parseFloat(latitude),
        parseFloat(longitude),
        parseInt(radius),
        specialties
      );
      
      // Apply additional filters
      hospitals = hospitals.filter(hospital => {
        if (search) {
          const searchRegex = new RegExp(search, 'i');
          return searchRegex.test(hospital.name) || 
                 searchRegex.test(hospital.address.city) || 
                 searchRegex.test(hospital.address.state);
        }
        return true;
      });

      total = hospitals.length;
      
      // Manual pagination for location-based results
      const skip = (parseInt(page) - 1) * parseInt(limit);
      hospitals = hospitals.slice(skip, skip + parseInt(limit));
    } else {
      // Regular query with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      [hospitals, total] = await Promise.all([
        Hospital.find(query)
          .sort({ 'capacity.availableBeds': -1, rating: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Hospital.countDocuments(query)
      ]);
    }

    res.json({
      success: true,
      data: {
        hospitals,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get hospitals error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get hospitals',
      message: 'An error occurred while fetching hospitals'
    });
  }
});

// @route   GET /api/hospitals/:hospitalId
// @desc    Get specific hospital details
// @access  Public
router.get('/:hospitalId', async (req, res) => {
  try {
    const { hospitalId } = req.params;

    const hospital = await Hospital.findOne({ hospitalId })
      .populate('staff.userId', 'firstName lastName email phone');

    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: 'Hospital not found',
        message: 'No hospital found with the provided ID'
      });
    }

    res.json({
      success: true,
      data: {
        hospital
      }
    });

  } catch (error) {
    console.error('Get hospital error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get hospital',
      message: 'An error occurred while fetching hospital details'
    });
  }
});

// @route   POST /api/hospitals
// @desc    Create a new hospital
// @access  Private (Admin only)
router.post('/', authenticateToken, authorize('admin'), [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Hospital name must be between 2 and 200 characters'),
  body('level')
    .isIn(['level_1', 'level_2', 'level_3', 'level_4', 'specialty'])
    .withMessage('Invalid hospital level'),
  body('contact.phone')
    .isMobilePhone()
    .withMessage('Invalid phone number'),
  body('contact.emergencyPhone')
    .isMobilePhone()
    .withMessage('Invalid emergency phone number'),
  body('contact.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('address.street')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters'),
  body('address.city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  body('coordinates.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  body('coordinates.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  body('capacity.totalBeds')
    .isInt({ min: 1 })
    .withMessage('Total beds must be at least 1')
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

    const hospitalData = req.body;
    
    // Set available beds equal to total beds initially
    hospitalData.capacity.availableBeds = hospitalData.capacity.totalBeds;

    const hospital = new Hospital(hospitalData);
    await hospital.save();

    res.status(201).json({
      success: true,
      message: 'Hospital created successfully',
      data: {
        hospital
      }
    });

  } catch (error) {
    console.error('Create hospital error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create hospital',
      message: 'An error occurred while creating the hospital'
    });
  }
});

// @route   PUT /api/hospitals/:hospitalId
// @desc    Update hospital information
// @access  Private (Hospital staff or admin)
router.put('/:hospitalId', authenticateToken, async (req, res) => {
  try {
    const { hospitalId } = req.params;

    const hospital = await Hospital.findOne({ hospitalId });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: 'Hospital not found',
        message: 'No hospital found with the provided ID'
      });
    }

    // Check permissions
    const isAdmin = req.user.userType === 'admin';
    const isHospitalStaff = hospital.staff.some(staff => 
      staff.userId.toString() === req.user._id.toString() && staff.isActive
    );

    if (!isAdmin && !isHospitalStaff) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You do not have permission to update this hospital'
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'name', 'contact', 'address', 'capacity', 'services', 'specialties',
      'operatingHours', 'acceptedInsurance', 'paymentMethods', 'status'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    updates.lastStatusUpdate = new Date();

    const updatedHospital = await Hospital.findOneAndUpdate(
      { hospitalId },
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Hospital updated successfully',
      data: {
        hospital: updatedHospital
      }
    });

  } catch (error) {
    console.error('Update hospital error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update hospital',
      message: 'An error occurred while updating the hospital'
    });
  }
});

// @route   PUT /api/hospitals/:hospitalId/capacity
// @desc    Update hospital bed capacity
// @access  Private (Hospital staff only)
router.put('/:hospitalId/capacity', hospitalStaffAuth, [
  body('bedType')
    .isIn(['general', 'icu', 'emergency'])
    .withMessage('Invalid bed type'),
  body('change')
    .isInt()
    .withMessage('Change must be an integer')
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

    const { hospitalId } = req.params;
    const { bedType, change } = req.body;

    const hospital = await Hospital.findOne({ hospitalId });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: 'Hospital not found',
        message: 'No hospital found with the provided ID'
      });
    }

    // Check if user is staff of this hospital
    if (req.hospital._id.toString() !== hospital._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only update capacity for your hospital'
      });
    }

    await hospital.updateBedAvailability(bedType, change);

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('hospital_capacity_updated', {
      hospitalId: hospital.hospitalId,
      bedType,
      change,
      newCapacity: hospital.capacity,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Hospital capacity updated successfully',
      data: {
        hospitalId: hospital.hospitalId,
        capacity: hospital.capacity
      }
    });

  } catch (error) {
    console.error('Update capacity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update capacity',
      message: 'An error occurred while updating hospital capacity'
    });
  }
});

// @route   GET /api/hospitals/:hospitalId/ambulances
// @desc    Get hospital ambulances
// @access  Private (Hospital staff only)
router.get('/:hospitalId/ambulances', hospitalStaffAuth, async (req, res) => {
  try {
    const { hospitalId } = req.params;

    const hospital = await Hospital.findOne({ hospitalId });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: 'Hospital not found',
        message: 'No hospital found with the provided ID'
      });
    }

    // Check if user is staff of this hospital
    if (req.hospital._id.toString() !== hospital._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only view ambulances for your hospital'
      });
    }

    const { status } = req.query;
    let ambulances = hospital.ambulances;

    if (status) {
      ambulances = ambulances.filter(ambulance => ambulance.status === status);
    }

    res.json({
      success: true,
      data: {
        ambulances,
        summary: {
          total: hospital.ambulances.length,
          available: hospital.getAvailableAmbulances().length,
          dispatched: hospital.ambulances.filter(a => a.status === 'dispatched').length,
          maintenance: hospital.ambulances.filter(a => a.status === 'maintenance').length
        }
      }
    });

  } catch (error) {
    console.error('Get ambulances error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get ambulances',
      message: 'An error occurred while fetching ambulances'
    });
  }
});

// @route   POST /api/hospitals/:hospitalId/ambulances/:ambulanceId/dispatch
// @desc    Dispatch an ambulance
// @access  Private (Hospital staff only)
router.post('/:hospitalId/ambulances/:ambulanceId/dispatch', hospitalStaffAuth, [
  body('destination.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid destination latitude'),
  body('destination.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid destination longitude'),
  body('destination.address')
    .optional()
    .isString()
    .withMessage('Invalid destination address')
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

    const { hospitalId, ambulanceId } = req.params;
    const { destination } = req.body;

    const hospital = await Hospital.findOne({ hospitalId });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: 'Hospital not found',
        message: 'No hospital found with the provided ID'
      });
    }

    // Check if user is staff of this hospital
    if (req.hospital._id.toString() !== hospital._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only dispatch ambulances from your hospital'
      });
    }

    try {
      await hospital.dispatchAmbulance(ambulanceId, destination);

      // Emit real-time update
      const io = req.app.get('io');
      io.emit('ambulance_dispatched', {
        hospitalId: hospital.hospitalId,
        ambulanceId,
        destination,
        dispatchedBy: req.user._id,
        timestamp: new Date()
      });

      res.json({
        success: true,
        message: 'Ambulance dispatched successfully',
        data: {
          hospitalId: hospital.hospitalId,
          ambulanceId,
          destination,
          dispatchedAt: new Date()
        }
      });

    } catch (dispatchError) {
      return res.status(400).json({
        success: false,
        error: 'Dispatch failed',
        message: dispatchError.message
      });
    }

  } catch (error) {
    console.error('Dispatch ambulance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to dispatch ambulance',
      message: 'An error occurred while dispatching the ambulance'
    });
  }
});

// @route   GET /api/hospitals/statistics/system
// @desc    Get system-wide hospital statistics
// @access  Private (Admin only)
router.get('/statistics/system', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const statistics = await Hospital.getSystemStatistics();

    res.json({
      success: true,
      data: {
        statistics: statistics[0] || {
          totalHospitals: 0,
          totalBeds: 0,
          availableBeds: 0,
          totalAmbulances: 0,
          availableAmbulances: 0,
          avgResponseTime: 0
        }
      }
    });

  } catch (error) {
    console.error('Get system statistics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics',
      message: 'An error occurred while fetching system statistics'
    });
  }
});

// @route   GET /api/hospitals/nearby/emergency
// @desc    Get nearby hospitals for emergency (public endpoint for emergency services)
// @access  Public
router.get('/nearby/emergency', [
  query('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  query('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  query('radius')
    .optional()
    .isInt({ min: 1, max: 100000 })
    .withMessage('Radius must be between 1 and 100000 meters'),
  query('specialty')
    .optional()
    .isString()
    .withMessage('Invalid specialty')
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
      latitude,
      longitude,
      radius = 50000, // 50km default
      specialty
    } = req.query;

    const specialties = specialty ? [specialty] : [];
    
    const hospitals = await Hospital.findNearby(
      parseFloat(latitude),
      parseFloat(longitude),
      parseInt(radius),
      specialties
    );

    // Filter to only show hospitals with available beds
    const availableHospitals = hospitals.filter(hospital => 
      hospital.capacity.availableBeds > 0 || 
      hospital.capacity.emergencyBeds.available > 0
    );

    res.json({
      success: true,
      data: {
        hospitals: availableHospitals,
        searchCriteria: {
          location: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
          radius: parseInt(radius),
          specialty
        }
      }
    });

  } catch (error) {
    console.error('Get nearby emergency hospitals error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get nearby hospitals',
      message: 'An error occurred while finding nearby hospitals'
    });
  }
});

module.exports = router;
