import { createAsyncThunk } from '@reduxjs/toolkit';
import { SERVER } from '../app/config';
import {apiClient} from '../api/apiClient';
import { setLocation } from './noteSlice';

// Select token from state
const selectToken = (state) => state.auth.token;
const selectUserId = (state) => state.auth.user?._id;

// Utility to validate and format the location coordinates
const validateLocation = (location) => {
  if (!location || !location.coordinates || location.coordinates.length !== 2) {
    throw new Error('Invalid location coordinates. Must contain latitude and longitude.');
  }
  
  const [longitude, latitude] = location.coordinates;
  
  // Ensure latitude and longitude are valid numbers
  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error('Invalid latitude or longitude values.');
  }

  // Return a properly formatted location (GeoJSON Point)
  return {
    type: 'Point',
    coordinates: [longitude, latitude],
  };
};

// Action creator for setting current location
export const setCurrentLocation = (location) => (dispatch) => {
  dispatch(setLocation(location));
};

// Fetch all notes for the current user
export const fetchUsersNotes = createAsyncThunk(
  'notes/fetchUsersNotes',
  async (_, { rejectWithValue, getState }) => {
    try {
      const response = await apiClient.get('/notes');
      return response.data;
    } catch (error) {
      console.error('Error fetching notes:', error);
      return rejectWithValue(error.response?.data?.message || 'Error fetching notes');
    }
  }
);

// Fetch notes by location
export const fetchNotesByLocation = createAsyncThunk(
  'notes/fetchNotesByLocation',
  async ({ latitude, longitude, radius }, { rejectWithValue, getState }) => {
    try {
      // Debug logging for troubleshooting
      console.log('Sending location data:', { latitude, longitude, radius });
      
      // Validate the coordinates
      if (latitude === undefined || longitude === undefined) {
        console.error('Invalid coordinates:', { latitude, longitude });
        return rejectWithValue('Invalid coordinates. Both latitude and longitude must be provided.');
      }
      
      // Make the request with direct latitude/longitude parameters
      try {
        const response = await apiClient.get('/notes/nearby', {
          params: {
            latitude,
            longitude,
            radius: radius || 1000
          }
        });
        
        console.log('Received response:', response.data);
        return response.data;
      } catch (error) {
        // If the error is a 404 (no notes found), return an empty array instead of rejecting
        if (error.response && error.response.status === 404) {
          console.log('No notes found near this location - returning empty array');
          return [];
        }
        // For other errors, reject as usual
        throw error;
      }
    } catch (error) {
      console.error('Error fetching notes by location:', error);
      return rejectWithValue(error.response?.data || 'Error fetching notes by location');
    }
  }
);

// Create a new note
export const createNote = createAsyncThunk(
  'notes/createNote',
  async (noteData, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const userId = selectUserId(state);
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      if (!noteData.body?.trim()) {
        throw new Error('Note content is required');
      }

      // Ensure note data matches schema
      const formattedData = {
        userId,
        email: noteData.email, // Add email field
        body: noteData.body.trim(),
        location: validateLocation(noteData.location),
        radius: Number(noteData.radius) || 1000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response = await apiClient.post('/notes/new', formattedData);
      return response.data;
    } catch (error) {
      console.error('Error creating note:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Error creating note');
    }
  }
);
// Update an existing note
export const updateNote = createAsyncThunk(
  'notes/updateNote',
  async ({ id, noteData }, { rejectWithValue, getState }) => {
    try {
      // Ensure note data matches schema
      const formattedData = {
        ...noteData,
        location: validateLocation(noteData.location),
        radius: Number(noteData.radius) || 1000,
        email: noteData.email
      };

      const response = await apiClient.put(`/notes/${id}`, formattedData);
      return response.data;
    } catch (error) {
      console.error('Error updating note:', error);
      return rejectWithValue(error.response?.data?.message || 'Error updating note');
    }
  }
);

// Delete a note
export const deleteNote = createAsyncThunk(
  'notes/deleteNote',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/notes/${id}`);
      return id;
    } catch (error) {
      console.error('Error deleting note:', error);
      return rejectWithValue(error.response?.data?.message || 'Error deleting note');
    }
  }
);
