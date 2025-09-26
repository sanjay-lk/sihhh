const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const emergencyContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  relationship: {
    type: String,
    required: true,
    enum: ['family', 'friend', 'colleague', 'other']
  },
  isPrimary: {
    type: Boolean,
    default: false
  }
});

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // User Type
  userType: {
    type: String,
    enum: ['driver', 'hospital', 'emergency_responder', 'admin'],
    default: 'driver'
  },
  
  // Driver-specific fields
  licenseNumber: {
    type: String,
    trim: true
  },
  vehicleInfo: {
    make: String,
    model: String,
    year: Number,
    licensePlate: String,
    color: String
  },
  
  // Medical Information
  medicalInfo: {
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    allergies: [String],
    medications: [String],
    medicalConditions: [String],
    emergencyMedicalInfo: String
  },
  
  // Emergency Contacts
  emergencyContacts: [emergencyContactSchema],
  
  // Location & Preferences
  homeAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // App Settings
  settings: {
    enableAutoDetection: {
      type: Boolean,
      default: true
    },
    enableLocationSharing: {
      type: Boolean,
      default: true
    },
    enableSMSAlerts: {
      type: Boolean,
      default: true
    },
    enablePushNotifications: {
      type: Boolean,
      default: true
    },
    sensitivityLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  
  // Device Information
  deviceInfo: {
    deviceId: String,
    platform: {
      type: String,
      enum: ['ios', 'android', 'web']
    },
    appVersion: String,
    fcmToken: String // For push notifications
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Timestamps
  lastLogin: Date,
  lastLocationUpdate: Date
}, {
  timestamps: true
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ 'deviceInfo.deviceId': 1 });
userSchema.index({ 'homeAddress.coordinates': '2dsphere' });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (excluding sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpires;
  delete userObject.verificationToken;
  return userObject;
};

// Method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Static method to find users by location (for emergency responders)
userSchema.statics.findNearbyUsers = function(latitude, longitude, maxDistance = 10000) {
  return this.find({
    'homeAddress.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    },
    isActive: true
  });
};

// Static method to find emergency contacts
userSchema.statics.findEmergencyContacts = function(userId) {
  return this.findById(userId).select('emergencyContacts firstName lastName');
};

module.exports = mongoose.model('User', userSchema);
