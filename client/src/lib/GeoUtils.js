/**
 * Utility functions for handling geolocation data consistently across the application
 */

/**
 * Converts any location format to GeoJSON Point format
 * @param {Object} location - Location object in any supported format
 * @returns {Object} Location in GeoJSON Point format
 */
export const toGeoJSONPoint = (location) => {
  try {
    if (!location) return null;
    
    // Already in GeoJSON Point format
    if (location.type === 'Point' && Array.isArray(location.coordinates)) {
      // Validate coordinates
      if (location.coordinates.length === 2 && 
          !isNaN(location.coordinates[0]) && 
          !isNaN(location.coordinates[1])) {
        return {
          type: 'Point',
          coordinates: [Number(location.coordinates[0]), Number(location.coordinates[1])]
        };
      }
    }
    
    // Simple {latitude, longitude} format
    if (location.latitude !== undefined && location.longitude !== undefined) {
      const lat = Number(location.latitude);
      const lng = Number(location.longitude);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        return {
          type: 'Point',
          coordinates: [lng, lat]
        };
      }
    }
    
    // Handle coordinates array [lng, lat]
    if (Array.isArray(location) && location.length === 2) {
      const lng = Number(location[0]);
      const lat = Number(location[1]);
      
      if (!isNaN(lng) && !isNaN(lat)) {
        return {
          type: 'Point',
          coordinates: [lng, lat]
        };
      }
    }
    
    // Handle string format "lat,lng"
    if (typeof location === 'string' && location.includes(',')) {
      const [lat, lng] = location.split(',').map(coord => parseFloat(coord.trim()));
      if (!isNaN(lat) && !isNaN(lng)) {
        return {
          type: 'Point',
          coordinates: [lng, lat]
        };
      }
    }
    
    console.warn('Invalid location format:', location);
    return null;
  } catch (error) {
    console.error('Error converting location to GeoJSON Point:', error);
    return null;
  }
};

/**
 * Converts GeoJSON Point to simple {latitude, longitude} format
 * @param {Object} geoPoint - GeoJSON Point object
 * @returns {Object} Simple location object
 */
export const fromGeoJSONPoint = (geoPoint) => {
  if (!geoPoint) return null;
  
  // Handle GeoJSON Point
  if (geoPoint.type === 'Point' && Array.isArray(geoPoint.coordinates) && geoPoint.coordinates.length === 2) {
    return {
      longitude: geoPoint.coordinates[0],
      latitude: geoPoint.coordinates[1]
    };
  }
  
  // Already in simple format
  if (typeof geoPoint.latitude === 'number' && typeof geoPoint.longitude === 'number') {
    return geoPoint;
  }
  
  console.warn('Invalid GeoJSON Point:', geoPoint);
  return null;
};

/**
 * Stores the current location in session storage in GeoJSON format
 * @param {Object} location - Location in any supported format
 */
export const storeCurrentLocation = (location) => {
  const geoJSONLocation = toGeoJSONPoint(location);
  if (geoJSONLocation) {
    sessionStorage.setItem('currentLocation', JSON.stringify(geoJSONLocation));
    return geoJSONLocation;
  }
  return null;
};

/**
 * Retrieves the current location from session storage
 * @param {boolean} asSimpleFormat - Whether to return in simple format
 * @returns {Object} Location object
 */
export const getCurrentLocationFromStorage = (asSimpleFormat = false) => {
  try {
    const locationString = sessionStorage.getItem('currentLocation');
    if (!locationString) return null;
    
    let storedLocation;
    try {
      storedLocation = JSON.parse(locationString);
    } catch (parseError) {
      console.error('Error parsing location from storage:', parseError);
      return null;
    }
    
    if (!storedLocation) return null;
    
    // Validate the location format
    const validatedLocation = toGeoJSONPoint(storedLocation);
    if (!validatedLocation) {
      console.warn('Invalid location format in storage, removing it');
      sessionStorage.removeItem('currentLocation');
      return null;
    }
    
    return asSimpleFormat ? fromGeoJSONPoint(validatedLocation) : validatedLocation;
  } catch (error) {
    console.error('Error retrieving location from storage:', error);
    return null;
  }
};

/**
 * Calculate distance between two points in kilometers
 * @param {Object} point1 - First point in any supported format
 * @param {Object} point2 - Second point in any supported format
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (point1, point2) => {
  const p1 = fromGeoJSONPoint(toGeoJSONPoint(point1));
  const p2 = fromGeoJSONPoint(toGeoJSONPoint(point2));
  
  if (!p1 || !p2) return null;
  
  // Haversine formula
  const R = 6371; // Earth's radius in km
  const dLat = toRad(p2.latitude - p1.latitude);
  const dLon = toRad(p2.longitude - p1.longitude);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(p1.latitude)) * Math.cos(toRad(p2.latitude)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
const toRad = (degrees) => degrees * Math.PI / 180;
