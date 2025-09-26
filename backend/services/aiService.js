/**
 * AI Service for Accident Detection and Analysis
 * This service processes sensor data to detect and analyze potential accidents
 */

/**
 * Analyze sensor data to determine if an accident occurred
 * @param {Array} sensorData - Array of sensor readings
 * @returns {Promise<Object>} AI analysis results
 */
const analyzeAccidentData = async (sensorData) => {
  try {
    // Extract features from sensor data
    const features = extractFeatures(sensorData);
    
    // Run accident detection algorithm
    const detectionResult = detectAccident(features);
    
    // Calculate confidence score
    const confidenceScore = calculateConfidenceScore(features, detectionResult);
    
    // Determine severity level
    const severityLevel = determineSeverity(features, confidenceScore);
    
    // Calculate impact force
    const impactForce = calculateImpactForce(features);
    
    // Calculate speed change
    const speedChange = calculateSpeedChange(sensorData);
    
    // Detect specific accident features
    const accidentFeatures = detectAccidentFeatures(features);
    
    return {
      confidenceScore: Math.round(confidenceScore * 100) / 100,
      severityLevel,
      impactForce: Math.round(impactForce * 100) / 100,
      speedChange: Math.round(speedChange * 100) / 100,
      detectionMethod: 'automatic',
      modelVersion: '1.0.0',
      processingTime: 0, // Will be set by caller
      features: accidentFeatures
    };
    
  } catch (error) {
    console.error('AI analysis error:', error);
    
    // Return fallback analysis
    return {
      confidenceScore: 50,
      severityLevel: 'moderate',
      impactForce: 0,
      speedChange: 0,
      detectionMethod: 'fallback',
      modelVersion: '1.0.0',
      processingTime: 0,
      features: {
        suddenDeceleration: false,
        highImpact: false,
        rollover: false,
        airbagDeployment: false,
        phoneDropped: false
      }
    };
  }
};

/**
 * Extract relevant features from raw sensor data
 * @param {Array} sensorData - Raw sensor readings
 * @returns {Object} Extracted features
 */
const extractFeatures = (sensorData) => {
  if (!sensorData || sensorData.length === 0) {
    throw new Error('No sensor data provided');
  }
  
  // Calculate accelerometer statistics
  const accelerometerMagnitudes = sensorData.map(d => d.accelerometer.magnitude);
  const maxAcceleration = Math.max(...accelerometerMagnitudes);
  const avgAcceleration = accelerometerMagnitudes.reduce((a, b) => a + b, 0) / accelerometerMagnitudes.length;
  const accelerationVariance = calculateVariance(accelerometerMagnitudes);
  
  // Calculate gyroscope statistics
  const gyroscopeData = sensorData.map(d => ({
    x: d.gyroscope.x,
    y: d.gyroscope.y,
    z: d.gyroscope.z,
    magnitude: Math.sqrt(d.gyroscope.x ** 2 + d.gyroscope.y ** 2 + d.gyroscope.z ** 2)
  }));
  
  const maxRotation = Math.max(...gyroscopeData.map(g => g.magnitude));
  const avgRotation = gyroscopeData.reduce((sum, g) => sum + g.magnitude, 0) / gyroscopeData.length;
  
  // Calculate speed statistics
  const speeds = sensorData.map(d => d.speed);
  const maxSpeed = Math.max(...speeds);
  const minSpeed = Math.min(...speeds);
  const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
  const speedDrop = maxSpeed - minSpeed;
  
  // Time-based features
  const duration = sensorData.length > 1 ? 
    (new Date(sensorData[sensorData.length - 1].timestamp) - new Date(sensorData[0].timestamp)) / 1000 : 0;
  
  // Jerk calculation (rate of change of acceleration)
  const jerkValues = [];
  for (let i = 1; i < accelerometerMagnitudes.length; i++) {
    const timeDiff = (new Date(sensorData[i].timestamp) - new Date(sensorData[i-1].timestamp)) / 1000;
    if (timeDiff > 0) {
      const jerk = Math.abs(accelerometerMagnitudes[i] - accelerometerMagnitudes[i-1]) / timeDiff;
      jerkValues.push(jerk);
    }
  }
  const maxJerk = jerkValues.length > 0 ? Math.max(...jerkValues) : 0;
  
  return {
    maxAcceleration,
    avgAcceleration,
    accelerationVariance,
    maxRotation,
    avgRotation,
    maxSpeed,
    minSpeed,
    avgSpeed,
    speedDrop,
    duration,
    maxJerk,
    dataPoints: sensorData.length
  };
};

/**
 * Detect if an accident occurred based on extracted features
 * @param {Object} features - Extracted features
 * @returns {Object} Detection result
 */
const detectAccident = (features) => {
  const thresholds = {
    highImpactAcceleration: 5.0, // 5g force
    suddenDeceleration: 30, // 30 km/h speed drop
    highRotation: 3.0, // 3 rad/s
    highJerk: 50, // m/s³
    minDuration: 0.5, // 0.5 seconds
    maxDuration: 10 // 10 seconds
  };
  
  const indicators = {
    highImpact: features.maxAcceleration > thresholds.highImpactAcceleration,
    suddenDeceleration: features.speedDrop > thresholds.suddenDeceleration,
    highRotation: features.maxRotation > thresholds.highRotation,
    highJerk: features.maxJerk > thresholds.highJerk,
    validDuration: features.duration >= thresholds.minDuration && features.duration <= thresholds.maxDuration,
    significantSpeedChange: features.speedDrop > 10,
    highAccelerationVariance: features.accelerationVariance > 2.0
  };
  
  // Count positive indicators
  const positiveIndicators = Object.values(indicators).filter(Boolean).length;
  const totalIndicators = Object.keys(indicators).length;
  
  return {
    indicators,
    positiveIndicators,
    totalIndicators,
    isAccident: positiveIndicators >= 3 // Need at least 3 positive indicators
  };
};

/**
 * Calculate confidence score for accident detection
 * @param {Object} features - Extracted features
 * @param {Object} detectionResult - Detection result
 * @returns {number} Confidence score (0-100)
 */
const calculateConfidenceScore = (features, detectionResult) => {
  let confidence = 0;
  
  // Base confidence from positive indicators
  const indicatorRatio = detectionResult.positiveIndicators / detectionResult.totalIndicators;
  confidence += indicatorRatio * 60; // Up to 60 points from indicators
  
  // Bonus points for strong signals
  if (features.maxAcceleration > 8.0) confidence += 15; // Very high impact
  if (features.speedDrop > 50) confidence += 15; // Very sudden deceleration
  if (features.maxRotation > 5.0) confidence += 10; // Very high rotation
  
  // Penalty for weak signals
  if (features.maxAcceleration < 2.0) confidence -= 20;
  if (features.speedDrop < 5) confidence -= 15;
  if (features.dataPoints < 3) confidence -= 10; // Too few data points
  
  // Ensure confidence is within bounds
  confidence = Math.max(0, Math.min(100, confidence));
  
  return confidence;
};

/**
 * Determine accident severity based on features and confidence
 * @param {Object} features - Extracted features
 * @param {number} confidence - Confidence score
 * @returns {string} Severity level
 */
const determineSeverity = (features, confidence) => {
  // Critical: Very high impact and confidence
  if (confidence > 90 && features.maxAcceleration > 10) {
    return 'critical';
  }
  
  // Severe: High impact or very high confidence
  if (confidence > 80 || features.maxAcceleration > 7) {
    return 'severe';
  }
  
  // Moderate: Medium confidence and impact
  if (confidence > 60 || features.maxAcceleration > 4) {
    return 'moderate';
  }
  
  // Minor: Low confidence but some indicators
  return 'minor';
};

/**
 * Calculate impact force from acceleration data
 * @param {Object} features - Extracted features
 * @returns {number} Impact force in G's
 */
const calculateImpactForce = (features) => {
  // Impact force is primarily based on maximum acceleration
  // Subtract 1g for gravity
  const impactForce = Math.max(0, features.maxAcceleration - 1.0);
  return impactForce;
};

/**
 * Calculate speed change from sensor data
 * @param {Array} sensorData - Raw sensor data
 * @returns {number} Speed change in km/h
 */
const calculateSpeedChange = (sensorData) => {
  if (sensorData.length < 2) return 0;
  
  const speeds = sensorData.map(d => d.speed);
  const maxSpeed = Math.max(...speeds);
  const minSpeed = Math.min(...speeds);
  
  return maxSpeed - minSpeed;
};

/**
 * Detect specific accident features
 * @param {Object} features - Extracted features
 * @returns {Object} Accident features
 */
const detectAccidentFeatures = (features) => {
  return {
    suddenDeceleration: features.speedDrop > 30,
    highImpact: features.maxAcceleration > 5.0,
    rollover: features.maxRotation > 4.0 && features.maxAcceleration > 3.0,
    airbagDeployment: features.maxAcceleration > 8.0, // Estimate based on high impact
    phoneDropped: features.maxAcceleration > 6.0 && features.accelerationVariance > 5.0
  };
};

/**
 * Calculate variance of an array of numbers
 * @param {Array} values - Array of numbers
 * @returns {number} Variance
 */
const calculateVariance = (values) => {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
  const variance = squaredDifferences.reduce((a, b) => a + b, 0) / values.length;
  
  return variance;
};

/**
 * Validate sensor data format
 * @param {Array} sensorData - Sensor data to validate
 * @returns {boolean} True if valid
 */
const validateSensorData = (sensorData) => {
  if (!Array.isArray(sensorData) || sensorData.length === 0) {
    return false;
  }
  
  return sensorData.every(data => {
    return data.accelerometer &&
           typeof data.accelerometer.x === 'number' &&
           typeof data.accelerometer.y === 'number' &&
           typeof data.accelerometer.z === 'number' &&
           data.gyroscope &&
           typeof data.gyroscope.x === 'number' &&
           typeof data.gyroscope.y === 'number' &&
           typeof data.gyroscope.z === 'number' &&
           typeof data.speed === 'number' &&
           data.timestamp;
  });
};

/**
 * Process real-time sensor data for continuous monitoring
 * @param {Object} sensorReading - Single sensor reading
 * @param {Array} recentReadings - Recent sensor readings buffer
 * @returns {Object} Real-time analysis result
 */
const processRealTimeSensorData = (sensorReading, recentReadings = []) => {
  try {
    // Add magnitude to accelerometer data
    sensorReading.accelerometer.magnitude = Math.sqrt(
      Math.pow(sensorReading.accelerometer.x, 2) +
      Math.pow(sensorReading.accelerometer.y, 2) +
      Math.pow(sensorReading.accelerometer.z, 2)
    );
    
    // Add to recent readings buffer (keep last 10 readings)
    recentReadings.push(sensorReading);
    if (recentReadings.length > 10) {
      recentReadings.shift();
    }
    
    // Quick threshold checks for immediate alerts
    const quickChecks = {
      highImpact: sensorReading.accelerometer.magnitude > 8.0,
      suddenStop: recentReadings.length >= 2 && 
                  Math.abs(sensorReading.speed - recentReadings[recentReadings.length - 2].speed) > 20,
      phoneDropped: sensorReading.accelerometer.magnitude > 10.0
    };
    
    const alertLevel = quickChecks.highImpact || quickChecks.suddenStop ? 'high' : 
                      quickChecks.phoneDropped ? 'medium' : 'low';
    
    return {
      alertLevel,
      quickChecks,
      shouldTriggerAnalysis: alertLevel === 'high' || 
                            (alertLevel === 'medium' && recentReadings.length >= 5),
      recentReadings
    };
    
  } catch (error) {
    console.error('Real-time sensor processing error:', error);
    return {
      alertLevel: 'low',
      quickChecks: {},
      shouldTriggerAnalysis: false,
      recentReadings
    };
  }
};

module.exports = {
  analyzeAccidentData,
  extractFeatures,
  detectAccident,
  calculateConfidenceScore,
  determineSeverity,
  calculateImpactForce,
  calculateSpeedChange,
  detectAccidentFeatures,
  validateSensorData,
  processRealTimeSensorData
};
