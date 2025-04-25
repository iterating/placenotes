import { calculateDistance } from './GeoUtils'; // Assuming GeoUtils exists here

/**
 * Formats a date string into a relative time string (e.g., '5 minutes ago', '2 days ago').
 * Falls back to locale date string for older dates.
 * @param {string | Date} dateString - The date string or Date object to format.
 * @returns {string} Formatted relative time string or date string.
 */
export const formatDateRelative = (dateString) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;

    // Handle future dates or invalid dates gracefully
    if (diffMs < 0 || isNaN(diffMs)) {
      return date.toLocaleDateString(); // Or 'Invalid date'
    }

    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffDay < 7) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Unknown date';
  }
};

/**
 * Formats location information for display, optionally showing distance from the current user.
 * @param {object} messageLocation - GeoJSON Point object { type: 'Point', coordinates: [lon, lat] }.
 * @param {object} currentUserLocation - GeoJSON Point object for the current user.
 * @returns {string | null} Formatted location string (e.g., '5 miles away', 'Location available') or null.
 */
export const formatLocationDistance = (messageLocation, currentUserLocation) => {
  try {
    if (!messageLocation) {
      return null; // No location data for the message
    }

    // Basic validation of message location format
    if (messageLocation.type !== 'Point' || 
        !Array.isArray(messageLocation.coordinates) || 
        messageLocation.coordinates.length !== 2 ||
        typeof messageLocation.coordinates[0] !== 'number' ||
        typeof messageLocation.coordinates[1] !== 'number') {
      console.warn('Invalid message location format:', messageLocation);
      return 'Location unavailable';
    }

    // If no current user location, just indicate location is present
    if (!currentUserLocation) {
      return 'Location available';
    }
    
     // Basic validation of user location format
    if (currentUserLocation.type !== 'Point' || 
        !Array.isArray(currentUserLocation.coordinates) || 
        currentUserLocation.coordinates.length !== 2 ||
        typeof currentUserLocation.coordinates[0] !== 'number' ||
        typeof currentUserLocation.coordinates[1] !== 'number') {
      console.warn('Invalid user location format:', currentUserLocation);
      return 'Location available (cannot calculate distance)'; // Cannot calculate distance
    }

    // Calculate distance
    const distance = calculateDistance(messageLocation, currentUserLocation);

    if (distance === null || isNaN(distance)) {
       console.warn('Distance calculation returned invalid result.');
      return 'Distance unknown';
    }

    // Format distance
    if (distance < 0.1) {
      return 'Very close';
    } else if (distance < 1) {
      const feet = Math.round(distance * 5280);
      return `About ${feet} feet away`;
    } else {
      return `${distance.toFixed(1)} miles away`;
    }

  } catch (error) {
    console.error('Error formatting location distance:', error);
    return 'Location info error';
  }
};
