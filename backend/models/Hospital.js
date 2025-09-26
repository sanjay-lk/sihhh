const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['emergency', 'trauma', 'surgery', 'icu', 'cardiology', 'neurology', 'orthopedics', 'pediatrics', 'other'],
    required: true
  },
  capacity: {
    total: { type: Number, required: true, min: 0 },
    available: { type: Number, required: true, min: 0 },
    occupied: { type: Number, default: 0, min: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  contactExtension: String,
  headOfDepartment: String
});

const ambulanceSchema = new mongoose.Schema({
  vehicleId: {
    type: String,
    required: true,
    unique: true
  },
  licensePlate: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['basic', 'advanced', 'critical_care', 'air_ambulance'],
    default: 'basic'
  },
  status: {
    type: String,
    enum: ['available', 'dispatched', 'en_route', 'on_scene', 'transporting', 'maintenance', 'offline'],
    default: 'available'
  },
  currentLocation: {
    latitude: Number,
    longitude: Number,
    address: String,
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  crew: [{
    name: String,
    role: {
      type: String,
      enum: ['driver', 'paramedic', 'emt', 'nurse', 'doctor']
    },
    certification: String,
    contactNumber: String
  }],
  equipment: [{
    name: String,
    status: {
      type: String,
      enum: ['functional', 'maintenance', 'broken'],
      default: 'functional'
    },
    lastChecked: Date
  }],
  fuelLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  mileage: {
    type: Number,
    default: 0
  },
  lastMaintenance: Date,
  nextMaintenance: Date
});

const staffSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeId: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['doctor', 'nurse', 'paramedic', 'technician', 'administrator', 'dispatcher', 'security'],
    required: true
  },
  department: String,
  specialization: String,
  shift: {
    type: String,
    enum: ['day', 'night', 'rotating', 'on_call'],
    default: 'day'
  },
  isOnDuty: {
    type: Boolean,
    default: false
  },
  contactNumber: String,
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  certifications: [String],
  hireDate: Date,
  isActive: {
    type: Boolean,
    default: true
  }
});

const hospitalSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  hospitalId: {
    type: String,
    unique: true,
    required: true
  },
  type: {
    type: String,
    enum: ['public', 'private', 'military', 'specialty', 'teaching'],
    default: 'public'
  },
  level: {
    type: String,
    enum: ['level_1', 'level_2', 'level_3', 'level_4', 'specialty'],
    required: true
  },
  
  // Contact Information
  contact: {
    phone: {
      type: String,
      required: true
    },
    emergencyPhone: {
      type: String,
      required: true
    },
    fax: String,
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    website: String
  },
  
  // Location
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'USA'
    }
  },
  coordinates: {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    }
  },
  
  // Capacity and Services
  capacity: {
    totalBeds: {
      type: Number,
      required: true,
      min: 0
    },
    availableBeds: {
      type: Number,
      required: true,
      min: 0
    },
    icuBeds: {
      total: { type: Number, default: 0 },
      available: { type: Number, default: 0 }
    },
    emergencyBeds: {
      total: { type: Number, default: 0 },
      available: { type: Number, default: 0 }
    },
    operatingRooms: {
      total: { type: Number, default: 0 },
      available: { type: Number, default: 0 }
    }
  },
  
  // Departments
  departments: [departmentSchema],
  
  // Services
  services: [{
    name: String,
    isAvailable: {
      type: Boolean,
      default: true
    },
    hours: {
      start: String, // "00:00"
      end: String,   // "23:59"
      is24x7: {
        type: Boolean,
        default: false
      }
    }
  }],
  
  // Specialties
  specialties: [{
    type: String,
    enum: [
      'trauma_center',
      'cardiac_care',
      'stroke_center',
      'burn_center',
      'pediatric_emergency',
      'maternity',
      'neurosurgery',
      'orthopedics',
      'oncology',
      'transplant',
      'psychiatric',
      'rehabilitation'
    ]
  }],
  
  // Staff
  staff: [staffSchema],
  
  // Ambulance Fleet
  ambulances: [ambulanceSchema],
  
  // Operational Status
  status: {
    type: String,
    enum: ['operational', 'limited', 'emergency_only', 'closed', 'maintenance'],
    default: 'operational'
  },
  
  // Emergency Response
  responseRadius: {
    type: Number,
    default: 50000, // 50km in meters
    min: 0
  },
  averageResponseTime: {
    type: Number,
    default: 0 // in minutes
  },
  
  // Ratings and Reviews
  rating: {
    overall: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    responseTime: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    careQuality: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  
  // Accreditation and Certifications
  accreditations: [{
    name: String,
    issuedBy: String,
    issuedDate: Date,
    expiryDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Insurance and Payment
  acceptedInsurance: [String],
  paymentMethods: [String],
  
  // Operating Hours
  operatingHours: {
    emergency: {
      is24x7: {
        type: Boolean,
        default: true
      },
      hours: String
    },
    general: {
      monday: { start: String, end: String },
      tuesday: { start: String, end: String },
      wednesday: { start: String, end: String },
      thursday: { start: String, end: String },
      friday: { start: String, end: String },
      saturday: { start: String, end: String },
      sunday: { start: String, end: String }
    }
  },
  
  // Statistics
  statistics: {
    totalPatientsServed: {
      type: Number,
      default: 0
    },
    emergencyCasesHandled: {
      type: Number,
      default: 0
    },
    averageWaitTime: {
      type: Number,
      default: 0 // in minutes
    },
    successRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  
  // System Integration
  isActive: {
    type: Boolean,
    default: true
  },
  lastStatusUpdate: {
    type: Date,
    default: Date.now
  },
  
  // API Integration
  apiKeys: {
    internal: String,
    external: [String]
  },
  
  // Notifications
  notificationSettings: {
    enableSMS: {
      type: Boolean,
      default: true
    },
    enableEmail: {
      type: Boolean,
      default: true
    },
    enablePush: {
      type: Boolean,
      default: true
    },
    alertThresholds: {
      capacityWarning: {
        type: Number,
        default: 80 // percentage
      },
      staffShortage: {
        type: Number,
        default: 70 // percentage
      }
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
hospitalSchema.index({ hospitalId: 1 });
hospitalSchema.index({ coordinates: '2dsphere' });
hospitalSchema.index({ 'contact.phone': 1 });
hospitalSchema.index({ status: 1 });
hospitalSchema.index({ specialties: 1 });
hospitalSchema.index({ 'capacity.availableBeds': 1 });

// Generate unique hospital ID
hospitalSchema.pre('save', function(next) {
  if (!this.hospitalId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 3);
    this.hospitalId = `HSP-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Virtual for occupancy rate
hospitalSchema.virtual('occupancyRate').get(function() {
  if (this.capacity.totalBeds === 0) return 0;
  const occupied = this.capacity.totalBeds - this.capacity.availableBeds;
  return Math.round((occupied / this.capacity.totalBeds) * 100);
});

// Method to update bed availability
hospitalSchema.methods.updateBedAvailability = function(bedType, change) {
  switch (bedType) {
    case 'general':
      this.capacity.availableBeds = Math.max(0, this.capacity.availableBeds + change);
      break;
    case 'icu':
      this.capacity.icuBeds.available = Math.max(0, this.capacity.icuBeds.available + change);
      break;
    case 'emergency':
      this.capacity.emergencyBeds.available = Math.max(0, this.capacity.emergencyBeds.available + change);
      break;
  }
  this.lastStatusUpdate = new Date();
  return this.save();
};

// Method to get available ambulances
hospitalSchema.methods.getAvailableAmbulances = function() {
  return this.ambulances.filter(ambulance => ambulance.status === 'available');
};

// Method to dispatch ambulance
hospitalSchema.methods.dispatchAmbulance = function(ambulanceId, destination) {
  const ambulance = this.ambulances.id(ambulanceId);
  if (ambulance && ambulance.status === 'available') {
    ambulance.status = 'dispatched';
    ambulance.currentLocation.lastUpdated = new Date();
    return this.save();
  }
  throw new Error('Ambulance not available for dispatch');
};

// Static method to find nearby hospitals
hospitalSchema.statics.findNearby = function(latitude, longitude, maxDistance = 50000, specialties = []) {
  const query = {
    coordinates: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    },
    isActive: true,
    status: { $in: ['operational', 'limited'] }
  };
  
  if (specialties.length > 0) {
    query.specialties = { $in: specialties };
  }
  
  return this.find(query).sort({ 'capacity.availableBeds': -1 });
};

// Static method to find hospitals with available beds
hospitalSchema.statics.findWithAvailableBeds = function(bedType = 'general', minBeds = 1) {
  const query = {
    isActive: true,
    status: 'operational'
  };
  
  switch (bedType) {
    case 'icu':
      query['capacity.icuBeds.available'] = { $gte: minBeds };
      break;
    case 'emergency':
      query['capacity.emergencyBeds.available'] = { $gte: minBeds };
      break;
    default:
      query['capacity.availableBeds'] = { $gte: minBeds };
  }
  
  return this.find(query).sort({ 'capacity.availableBeds': -1 });
};

// Static method to get hospital statistics
hospitalSchema.statics.getSystemStatistics = function() {
  return this.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: null,
        totalHospitals: { $sum: 1 },
        totalBeds: { $sum: '$capacity.totalBeds' },
        availableBeds: { $sum: '$capacity.availableBeds' },
        totalAmbulances: { $sum: { $size: '$ambulances' } },
        availableAmbulances: {
          $sum: {
            $size: {
              $filter: {
                input: '$ambulances',
                cond: { $eq: ['$$this.status', 'available'] }
              }
            }
          }
        },
        avgResponseTime: { $avg: '$averageResponseTime' }
      }
    }
  ]);
};

module.exports = mongoose.model('Hospital', hospitalSchema);
