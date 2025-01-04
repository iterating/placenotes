import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { SERVER } from '../app/config';

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
      const response = await axios.get(`${SERVER}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notes:', error);
      return rejectWithValue(error.response?.data || 'Error fetching notes');
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
      const response = await axios.get(`${SERVER}/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching note:', error);
      return rejectWithValue(error.response?.data || 'Error fetching note');
    }
  }
);

// Edit a note
export const editNote = createAsyncThunk(
  'notes/editNote',
  async ({ id, note }, { getState, rejectWithValue }) => {
    const token = selectToken(getState());
    if (!token) return rejectWithValue('No token available');

    try {
      // Validate and format the location field
      if (note?.location) {
        const validatedLocation = validateLocation(note.location);
        if (!validatedLocation) {
          return rejectWithValue('Invalid location');
        }
        note.location = validatedLocation;
      }

      // Set default values and add id to note
      const updatedNote = {
        ...note,
        _id: id,
        body: note?.body || '',
        radius: note?.radius || 100,
        recipients: note?.recipients || [],
      };

      // Send the patch request to the server
      const response = await axios.put(`${SERVER}/notes/${id}`, updatedNote, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error) {
      console.error('Error editing note:', error);
      return rejectWithValue(error.response?.data || 'Error editing note');
    }
  }
);

// Create a new note
export const createNote = createAsyncThunk(
  'notes/createNote',
  async ({ note }, { getState, rejectWithValue }) => {
    const token = selectToken(getState());
    if (!token) {
      console.error('No token available');
      return rejectWithValue('No token available');
    }

    try {
      console.log('Creating note with data:', note);

      // Validate and format the location field
      if (note.location) {
        note.location = validateLocation(note.location);
        console.log('Validated location:', note.location);
      }

      const response = await axios.post(`${SERVER}/notes/new`, note, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Note created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating note:', error);
      return rejectWithValue(error.response?.data || 'Error creating note');
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
    console.log("Deleting note:", id);
    try {
      const response = await axios.delete(`${SERVER}/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Deleted note:", response.data);
      return response.data;
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
