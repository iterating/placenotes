import React from 'react'
import { toGeoJSONPoint, storeCurrentLocation } from './GeoUtils';

/**
 * Gets the current geolocation from the browser and returns it in GeoJSON format
 * @returns {Promise} Promise resolving to location in GeoJSON Point format
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Create location object in simple format first
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        
        // Convert to GeoJSON Point format
        const geoJSONLocation = toGeoJSONPoint(location);
        
        // Store in session storage for later use
        storeCurrentLocation(geoJSONLocation);
        
        // Resolve with GeoJSON format
        resolve(geoJSONLocation);
      },
      (error) => {
        console.error('Error getting geolocation:', error);
        reject(error);
      }
    );
  });
}

export default getCurrentLocation