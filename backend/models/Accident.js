const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
  accelerometer: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    z: { type: Number, required: true },
    magnitude: { type: Number, required: true }
  },
  gyroscope: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    z: { type: Number, required: true }
  },
  speed: {
    type: Number,
    required: true,
    min: 0
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  }
});

const locationSchema = new mongoose.Schema({
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
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    formattedAddress: String
  },
  accuracy: {
    type: Number,
    min: 0
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  }
});

const aiAnalysisSchema = new mongoose.Schema({
  confidenceScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  severityLevel: {
    type: String,
    enum: ['minor', 'moderate', 'severe', 'critical'],
    required: true
  },
  impactForce: {
    type: Number,
    required: true,
    min: 0
  },
  speedChange: {
    type: Number,
    required: true
  },
  detectionMethod: {
    type: String,
    enum: ['automatic', 'manual', 'third_party'],
    default: 'automatic'
  },
  modelVersion: {
    type: String,
    default: '1.0.0'
  },
  processingTime: {
    type: Number, // in milliseconds
    required: true
  },
  features: {
    suddenDeceleration: Boolean,
    highImpact: Boolean,
    rollover: Boolean,
    airbagDeployment: Boolean,
    phoneDropped: Boolean
  }
});

const responseSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital'
  },
  responderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  responseType: {
    type: String,
    enum: ['ambulance', 'police', 'fire', 'medical_helicopter'],
    required: true
  },
  status: {
    type: String,
    enum: ['dispatched', 'en_route', 'on_scene', 'transporting', 'completed', 'cancelled'],
    default: 'dispatched'
  },
  estimatedArrival: Date,
  actualArrival: Date,
  notes: String,
  dispatchedAt: {
    type: Date,
    default: Date.now
  }
});

const accidentSchema = new mongoose.Schema({
  // Basic Information
  accidentId: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Accident Details
  status: {
    type: String,
    enum: ['detected', 'confirmed', 'false_alarm', 'responded', 'resolved'],
    default: 'detected'
  },
  severity: {
    type: String,
    enum: ['minor', 'moderate', 'severe', 'critical'],
    required: true
  },
  
  // Location Information
  location: {
    type: locationSchema,
    required: true
  },
  
  // Sensor Data
  sensorData: {
    type: [sensorDataSchema],
    required: true
  },
  
  // AI Analysis
  aiAnalysis: {
    type: aiAnalysisSchema,
    required: true
  },
  
  // Emergency Response
  responses: [responseSchema],
  
  // Notifications
  notifications: {
    emergencyContacts: [{
      contactId: String,
      name: String,
      phone: String,
      sentAt: Date,
      status: {
        type: String,
        enum: ['sent', 'delivered', 'failed'],
        default: 'sent'
      }
    }],
    hospitals: [{
      hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital'
      },
      sentAt: Date,
      acknowledged: Boolean,
      acknowledgedAt: Date,
      acknowledgedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    emergencyServices: [{
      serviceType: {
        type: String,
        enum: ['police', 'ambulance', 'fire']
      },
      contactNumber: String,
      sentAt: Date,
      status: String
    }]
  },
  
  // Additional Information
  description: String,
  images: [String], // URLs to uploaded images
  audioRecording: String, // URL to audio recording
  
  // User Confirmation
  userConfirmed: {
    type: Boolean,
    default: false
  },
  userConfirmedAt: Date,
  falseAlarm: {
    type: Boolean,
    default: false
  },
  falseAlarmReason: String,
  
  // Medical Information
  injuries: [{
    type: {
      type: String,
      enum: ['head', 'neck', 'chest', 'abdomen', 'limbs', 'back', 'other']
    },
    severity: {
      type: String,
      enum: ['minor', 'moderate', 'severe']
    },
    description: String
  }],
  consciousness: {
    type: String,
    enum: ['conscious', 'unconscious', 'semi_conscious', 'unknown'],
    default: 'unknown'
  },
  
  // Timeline
  detectedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  confirmedAt: Date,
  firstResponseAt: Date,
  resolvedAt: Date,
  
  // Metadata
  deviceInfo: {
    platform: String,
    appVersion: String,
    batteryLevel: Number,
    networkType: String
  },
  
  // Analytics
  responseTime: Number, // in seconds
  falsePositive: Boolean,
  feedbackScore: {
    type: Number,
    min: 1,
    max: 5
  },
  feedbackComments: String
}, {
  timestamps: true
});

// Indexes for performance
accidentSchema.index({ accidentId: 1 });
accidentSchema.index({ userId: 1 });
accidentSchema.index({ status: 1 });
accidentSchema.index({ severity: 1 });
accidentSchema.index({ detectedAt: -1 });
accidentSchema.index({ 'location.coordinates': '2dsphere' });
accidentSchema.index({ 'aiAnalysis.confidenceScore': -1 });

// Generate unique accident ID
accidentSchema.pre('save', function(next) {
  if (!this.accidentId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.accidentId = `ACC-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Virtual for response time calculation
accidentSchema.virtual('calculatedResponseTime').get(function() {
  if (this.firstResponseAt && this.detectedAt) {
    return Math.floor((this.firstResponseAt - this.detectedAt) / 1000); // in seconds
  }
  return null;
});

// Method to update status
accidentSchema.methods.updateStatus = function(newStatus, userId = null) {
  this.status = newStatus;
  
  switch (newStatus) {
    case 'confirmed':
      this.confirmedAt = new Date();
      this.userConfirmed = true;
      this.userConfirmedAt = new Date();
      break;
    case 'false_alarm':
      this.falseAlarm = true;
      this.resolvedAt = new Date();
      break;
    case 'responded':
      if (!this.firstResponseAt) {
        this.firstResponseAt = new Date();
      }
      break;
    case 'resolved':
      this.resolvedAt = new Date();
      if (this.firstResponseAt && this.detectedAt) {
        this.responseTime = Math.floor((this.firstResponseAt - this.detectedAt) / 1000);
      }
      break;
  }
  
  return this.save();
};

// Method to add response
accidentSchema.methods.addResponse = function(responseData) {
  this.responses.push(responseData);
  if (this.status === 'detected' || this.status === 'confirmed') {
    this.status = 'responded';
    if (!this.firstResponseAt) {
      this.firstResponseAt = new Date();
    }
  }
  return this.save();
};

// Static method to find recent accidents
accidentSchema.statics.findRecent = function(hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  return this.find({
    detectedAt: { $gte: since }
  }).sort({ detectedAt: -1 });
};

// Static method to find accidents by location
accidentSchema.statics.findNearby = function(latitude, longitude, maxDistance = 50000) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    }
  }).sort({ detectedAt: -1 });
};

// Static method to get accident statistics
accidentSchema.statics.getStatistics = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        detectedAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        totalAccidents: { $sum: 1 },
        confirmedAccidents: {
          $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
        },
        falseAlarms: {
          $sum: { $cond: ['$falseAlarm', 1, 0] }
        },
        avgResponseTime: { $avg: '$responseTime' },
        severityBreakdown: {
          $push: '$severity'
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Accident', accidentSchema);
