import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { SERVER } from '../app/config';
import apiClient from '../lib/apiClient';

// Select token from state
const selectToken = (state) => state.auth.token;

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

// Fetch all notes
export const fetchUsersNotes = createAsyncThunk(
  'notes/fetchUsersNotes',
  async (_, { getState, rejectWithValue }) => {
    const token = selectToken(getState());
    if (!token) {
      return rejectWithValue('No token available');
    }
    try {
      const { data } = await apiClient.get('/notes');
      return data.map(note => ({ ...note, showFullNote: false }));
    } catch (error) {
      console.error('Error fetching notes:', error);
      return rejectWithValue(error.response?.data || 'Error fetching notes');
    }
  }
);

// Fetch notes by location
export const fetchNotesByLocation = createAsyncThunk(
  'notes/fetchNotesByLocation',
  async ({ latitude, longitude }, { getState, rejectWithValue }) => {
    const token = selectToken(getState());
    if (!token) {
      return rejectWithValue('No token available');
    }

    try {
      // Validate coordinates
      if (isNaN(latitude) || isNaN(longitude) ||
          latitude < -90 || latitude > 90 ||
          longitude < -180 || longitude > 180) {
        throw new Error('Invalid coordinates');
      }

      const location = {
        type: 'Point',
        coordinates: [longitude, latitude]
      };
      
      console.log('Fetching notes with location:', JSON.stringify(location));
      
      const { data } = await apiClient.get('/notes/nearby', {
        params: { location: JSON.stringify(location) },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Received notes:', data);
      return data.map(note => ({ ...note, showFullNote: false }));
    } catch (error) {
      console.error('Error fetching notes by location:', error);
      if (error.response?.status === 400) {
        return rejectWithValue('Invalid location format or coordinates');
      } else if (error.response?.status === 401) {
        return rejectWithValue('Authentication required');
      } else {
        return rejectWithValue(error.response?.data?.message || 'Error fetching notes by location');
      }
    }
  }
);

// Fetch a single note
export const fetchOneNote = createAsyncThunk(
  'notes/fetchOneNote',
  async ({ id }, { getState, rejectWithValue }) => {
    const token = selectToken(getState());
    if (!token) {
      return rejectWithValue('No token available');
    }
    try {
      const { data } = await apiClient.get(`/notes/${id}`);
      return data;
    } catch (error) {
      console.error('Error fetching note:', error);
      return rejectWithValue(error.response?.data || 'Error fetching note');
    }
  }
);

// Create a new note
export const createNote = createAsyncThunk(
  'notes/createNote',
  async (noteData, { getState, rejectWithValue }) => {
    const token = selectToken(getState());
    if (!token) {
      return rejectWithValue('No token available');
    }
    try {
      const { data } = await apiClient.post('/notes', noteData);
      return data;
    } catch (error) {
      console.error('Error creating note:', error);
      return rejectWithValue(error.response?.data || 'Error creating note');
    }
  }
);

// Update a note
export const updateNote = createAsyncThunk(
  'notes/updateNote',
  async ({ id, update }, { getState, rejectWithValue }) => {
    const token = selectToken(getState());
    if (!token) {
      return rejectWithValue('No token available');
    }
    try {
      const { data } = await apiClient.put(`/notes/${id}`, update);
      return data;
    } catch (error) {
      console.error('Error updating note:', error);
      return rejectWithValue(error.response?.data || 'Error updating note');
    }
  }
);

// Delete a note
export const deleteNote = createAsyncThunk(
  'notes/deleteNote',
  async ({ id }, { getState, rejectWithValue }) => {
    const token = selectToken(getState());
    if (!token) {
      return rejectWithValue('No token available');
    }
    try {
      const { data } = await apiClient.delete(`/notes/${id}`);
      return { id, data };
    } catch (error) {
      console.error('Error deleting note:', error);
      return rejectWithValue(error.response?.data || 'Error deleting note');
    }
  }
);

// Action for setting current location
export const SET_CURRENT_LOCATION = 'SET_CURRENT_LOCATION';
export const setCurrentLocation = (location) => ({
  type: SET_CURRENT_LOCATION,
  payload: location,
});
