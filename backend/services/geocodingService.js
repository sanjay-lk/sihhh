const NodeGeocoder = require('node-geocoder');

// Initialize geocoder
const geocoder = NodeGeocoder({
  provider: 'google',
  apiKey: process.env.GOOGLE_MAPS_API_KEY,
  formatter: null
});

/**
 * Get address information from coordinates
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<Object>} Address information
 */
const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not configured, using fallback');
      return getFallbackAddress(latitude, longitude);
    }

    const results = await geocoder.reverse({ lat: latitude, lon: longitude });
    
    if (results && results.length > 0) {
      const result = results[0];
      
      return {
        street: result.streetName || '',
        city: result.city || '',
        state: result.administrativeLevels?.level1short || result.state || '',
        zipCode: result.zipcode || '',
        country: result.country || '',
        formattedAddress: result.formattedAddress || `${latitude}, ${longitude}`
      };
    } else {
      return getFallbackAddress(latitude, longitude);
    }
    
  } catch (error) {
    console.error('Geocoding error:', error);
    return getFallbackAddress(latitude, longitude);
  }
};

/**
 * Get coordinates from address string
 * @param {string} address - Address string
 * @returns {Promise<Object>} Coordinates and formatted address
 */
const getCoordinatesFromAddress = async (address) => {
  try {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key not configured');
    }

    const results = await geocoder.geocode(address);
    
    if (results && results.length > 0) {
      const result = results[0];
      
      return {
        coordinates: {
          latitude: result.latitude,
          longitude: result.longitude
        },
        formattedAddress: result.formattedAddress,
        accuracy: result.extra?.confidence || 'unknown'
      };
    } else {
      throw new Error('Address not found');
    }
    
  } catch (error) {
    console.error('Forward geocoding error:', error);
    throw new Error(`Failed to geocode address: ${error.message}`);
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {number} Distance in meters
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};

/**
 * Find nearby places of interest (hospitals, police stations, etc.)
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {string} type - Place type (hospital, police, etc.)
 * @param {number} radius - Search radius in meters
 * @returns {Promise<Array>} Array of nearby places
 */
const findNearbyPlaces = async (latitude, longitude, type = 'hospital', radius = 10000) => {
  try {
    // This would typically use Google Places API
    // For now, return a mock response
    console.log(`Finding nearby ${type} within ${radius}m of ${latitude}, ${longitude}`);
    
    // Mock data - in production, this would call Google Places API
    const mockPlaces = [
      {
        name: `Nearby ${type} 1`,
        address: 'Mock Address 1',
        coordinates: {
          latitude: latitude + 0.01,
          longitude: longitude + 0.01
        },
        distance: calculateDistance(latitude, longitude, latitude + 0.01, longitude + 0.01),
        rating: 4.2,
        isOpen: true
      },
      {
        name: `Nearby ${type} 2`,
        address: 'Mock Address 2',
        coordinates: {
          latitude: latitude - 0.01,
          longitude: longitude - 0.01
        },
        distance: calculateDistance(latitude, longitude, latitude - 0.01, longitude - 0.01),
        rating: 4.5,
        isOpen: true
      }
    ];
    
    return mockPlaces.filter(place => place.distance <= radius);
    
  } catch (error) {
    console.error('Find nearby places error:', error);
    return [];
  }
};

/**
 * Get route information between two points
 * @param {Object} origin - Origin coordinates {latitude, longitude}
 * @param {Object} destination - Destination coordinates {latitude, longitude}
 * @param {string} mode - Travel mode (driving, walking, transit)
 * @returns {Promise<Object>} Route information
 */
const getRouteInfo = async (origin, destination, mode = 'driving') => {
  try {
    // This would typically use Google Directions API
    // For now, return calculated distance and estimated time
    
    const distance = calculateDistance(
      origin.latitude, origin.longitude,
      destination.latitude, destination.longitude
    );
    
    // Rough time estimates based on mode
    let estimatedTime; // in seconds
    switch (mode) {
      case 'driving':
        estimatedTime = distance / 15; // ~54 km/h average speed
        break;
      case 'walking':
        estimatedTime = distance / 1.4; // ~5 km/h walking speed
        break;
      case 'transit':
        estimatedTime = distance / 10; // ~36 km/h average transit speed
        break;
      default:
        estimatedTime = distance / 15;
    }
    
    return {
      distance: Math.round(distance),
      duration: Math.round(estimatedTime),
      mode,
      overview: `${Math.round(distance/1000)} km via ${mode}`,
      steps: [
        {
          instruction: `Head ${getDirection(origin, destination)} on current road`,
          distance: Math.round(distance * 0.3),
          duration: Math.round(estimatedTime * 0.3)
        },
        {
          instruction: 'Continue straight',
          distance: Math.round(distance * 0.4),
          duration: Math.round(estimatedTime * 0.4)
        },
        {
          instruction: 'Arrive at destination',
          distance: Math.round(distance * 0.3),
          duration: Math.round(estimatedTime * 0.3)
        }
      ]
    };
    
  } catch (error) {
    console.error('Route calculation error:', error);
    throw new Error(`Failed to calculate route: ${error.message}`);
  }
};

/**
 * Get direction between two points
 * @param {Object} origin - Origin coordinates
 * @param {Object} destination - Destination coordinates
 * @returns {string} Direction (north, south, east, west, etc.)
 */
const getDirection = (origin, destination) => {
  const latDiff = destination.latitude - origin.latitude;
  const lonDiff = destination.longitude - origin.longitude;
  
  if (Math.abs(latDiff) > Math.abs(lonDiff)) {
    return latDiff > 0 ? 'north' : 'south';
  } else {
    return lonDiff > 0 ? 'east' : 'west';
  }
};

/**
 * Fallback address when geocoding service is unavailable
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Object} Fallback address information
 */
const getFallbackAddress = (latitude, longitude) => {
  return {
    street: '',
    city: 'Unknown',
    state: '',
    zipCode: '',
    country: '',
    formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
  };
};

/**
 * Validate coordinates
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {boolean} True if coordinates are valid
 */
const validateCoordinates = (latitude, longitude) => {
  return typeof latitude === 'number' && 
         typeof longitude === 'number' &&
         latitude >= -90 && latitude <= 90 &&
         longitude >= -180 && longitude <= 180;
};

/**
 * Get timezone information for coordinates
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<Object>} Timezone information
 */
const getTimezone = async (latitude, longitude) => {
  try {
    // This would typically use Google Timezone API
    // For now, return a basic timezone estimate based on longitude
    
    const timezoneOffset = Math.round(longitude / 15); // Rough estimate
    const timezoneId = `UTC${timezoneOffset >= 0 ? '+' : ''}${timezoneOffset}`;
    
    return {
      timezoneId,
      timezoneName: `GMT${timezoneOffset >= 0 ? '+' : ''}${timezoneOffset}`,
      utcOffset: timezoneOffset * 3600, // seconds
      isDst: false // Would need to calculate based on date and location
    };
    
  } catch (error) {
    console.error('Timezone lookup error:', error);
    return {
      timezoneId: 'UTC',
      timezoneName: 'UTC',
      utcOffset: 0,
      isDst: false
    };
  }
};

/**
 * Batch geocode multiple addresses
 * @param {Array} addresses - Array of address strings
 * @returns {Promise<Array>} Array of geocoding results
 */
const batchGeocode = async (addresses) => {
  try {
    const results = await Promise.allSettled(
      addresses.map(address => getCoordinatesFromAddress(address))
    );
    
    return results.map((result, index) => ({
      address: addresses[index],
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason.message : null
    }));
    
  } catch (error) {
    console.error('Batch geocoding error:', error);
    throw new Error(`Failed to batch geocode: ${error.message}`);
  }
};

module.exports = {
  getAddressFromCoordinates,
  getCoordinatesFromAddress,
  calculateDistance,
  findNearbyPlaces,
  getRouteInfo,
  getDirection,
  validateCoordinates,
  getTimezone,
  batchGeocode
};
