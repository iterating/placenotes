import { createSelector } from '@reduxjs/toolkit';

// Base selector for the notes slice state
export const selectNotesState = (state) => state.notes;

// Select the normalized notes map
export const selectNotesMap = (state) => state.notes.notes;

// Select all notes as an array (derived from the map)
export const selectAllNotes = createSelector(
  [selectNotesMap],
  (notesMap) => Object.values(notesMap)
);

// Select note status and error
export const selectNoteStatus = (state) => state.notes.status;
export const selectNoteError = (state) => state.notes.error;

// Select current location stored in the notes slice
export const selectLocation = (state) => state.notes.location;

// Select the map/panel expansion state
export const selectIsMapExpanded = (state) => state.notes.isMapExpanded;

// Select a specific note by ID
export const selectNoteById = createSelector(
  [selectNotesMap, (state, noteId) => noteId],
  (notesMap, noteId) => notesMap[noteId]
);

// Memoized selector for sorted notes
export const selectSortedNotes = createSelector(
  [selectAllNotes, selectLocation, (state, sortMethod) => sortMethod],
  (notes, currentLocation, sortMethod) => {
    // Create a copy to avoid mutating the result of selectAllNotes
    const notesCopy = [...notes];

    switch (sortMethod) {
      case 'time':
        // Sort by time created (newest first)
        return notesCopy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'alphabetical':
        // Sort alphabetically by note body (A-Z) - CORRECTED to use 'body'
        return notesCopy.sort((a, b) => (a.body || '').localeCompare(b.body || ''));
      case 'reverseAlphabetical':
        // Sort reverse alphabetically by note body (Z-A) - CORRECTED to use 'body'
        return notesCopy.sort((a, b) => (b.body || '').localeCompare(a.body || ''));
      case 'location':
        // Sort by distance from currentLocation (nearest first)
        if (!currentLocation || !currentLocation.coordinates) {
          console.warn("Cannot sort by location: Current location unavailable.");
          // Default to time sort if location is missing
          return notesCopy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        const [currentLon, currentLat] = currentLocation.coordinates;
        
        return notesCopy.sort((a, b) => {
          const locA = a.location?.coordinates;
          const locB = b.location?.coordinates;

          // Handle notes without location data (push them to the end)
          if (!locA && !locB) return 0; // Keep relative order if both missing
          if (!locA) return 1;  // a is missing, comes after b
          if (!locB) return -1; // b is missing, comes after a

          const [lonA, latA] = locA;
          const [lonB, latB] = locB;
          
          // Basic distance calculation (sqrt not needed for comparison)
          const distA = Math.pow(lonA - currentLon, 2) + Math.pow(latA - currentLat, 2);
          const distB = Math.pow(lonB - currentLon, 2) + Math.pow(latB - currentLat, 2);
          
          return distA - distB;
        });
      default:
        // Default to sorting by time if sortMethod is unrecognized
        return notesCopy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }
);
