import { apiClient } from '../../../api/apiClient';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { toGeoJSONPoint } from '../../../lib/GeoUtils';
import { setMessages, addMessage, markAsRead } from './messageSlice';

// Utility function to validate location data
const validateLocation = (location) => {
  // Convert to GeoJSON Point format if needed
  const geoJSONLocation = toGeoJSONPoint(location);
  
  // Check if location is valid
  if (!geoJSONLocation || !geoJSONLocation.type || geoJSONLocation.type !== 'Point' || 
      !geoJSONLocation.coordinates || !Array.isArray(geoJSONLocation.coordinates) || 
      geoJSONLocation.coordinates.length !== 2) {
    throw new Error('Invalid location coordinates. Must be convertible to GeoJSON Point format.');
  }
  
  // Extract coordinates
  const [longitude, latitude] = geoJSONLocation.coordinates;
  
  // Ensure latitude and longitude are valid numbers
  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error('Invalid latitude or longitude values.');
  }
  
  // Return a properly formatted GeoJSON Point object
  return {
    type: 'Point',
    coordinates: [longitude, latitude],
  };
};

// Fetch all messages for the current user by received time (inbox)
export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (page = 1, { dispatch, rejectWithValue }) => {
    try {
      // Use the new list endpoint that returns messages by received time
      const response = await apiClient.get('/messages/list', {
        params: { page }
      });
      dispatch(setMessages(response.data));
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return rejectWithValue(error.response?.data?.message || 'Error fetching messages');
    }
  }
);

// Send a new message
export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (messageData, { dispatch, rejectWithValue }) => {
    try {
      // Validate location if provided, ensuring GeoJSON Point format
      let validatedLocation = null;
      if (messageData.location) {
        validatedLocation = validateLocation(messageData.location);
      }
      
      // Prepare message data
      const data = {
        recipientId: messageData.recipientId,
        content: messageData.content.trim(),
        location: validatedLocation,
        radius: Number(messageData.radius) || 1000,
        parentMessageId: messageData.parentMessageId || null // Add parentMessageId for replies
      };
      
      // Make API request
      const response = await apiClient.post('/messages/create', data);
      
      // Ensure returned message has location in GeoJSON format
      dispatch(addMessage({
        ...response.data,
        location: response.data.location || validatedLocation
      }));
      return {
        ...response.data,
        location: response.data.location || validatedLocation
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Mark message as read
export const markMessageAsRead = createAsyncThunk(
  'messages/markAsRead',
  async (messageId, { dispatch, rejectWithValue }) => {
    // Add validation for messageId
    if (!messageId) {
      console.warn('Attempted to mark a message as read without a valid messageId');
      return rejectWithValue('Invalid message ID');
    }
    
    try {
      await apiClient.put(`/messages/${messageId}/read`);
      dispatch(markAsRead(messageId));
      return { success: true, messageId };
    } catch (error) {
      console.error('Error marking message as read:', error);
      return rejectWithValue(error.response?.data?.message || 'Error marking message as read');
    }
  }
);

// Fetch messages by location (nearby)
export const fetchMessagesByLocation = createAsyncThunk(
  'messages/fetchByLocation',
  async ({ location, radius = 1000, page = 1 }, { dispatch, rejectWithValue }) => {
    try {
      // Ensure location is in GeoJSON Point format
      const validatedLocation = validateLocation(location);
      
      // Prepare request parameters
      const params = {
        longitude: validatedLocation.coordinates[0],
        latitude: validatedLocation.coordinates[1],
        radius,
        page
      };
      
      // Make API request
      const response = await apiClient.get('/messages/nearby', { params });
      
      // Ensure all returned messages have location in GeoJSON format
      dispatch(setMessages(response.data.map(message => ({
        ...message,
        location: message.location || validatedLocation
      }))));
      return response.data.map(message => ({
        ...message,
        location: message.location || validatedLocation
      }));
    } catch (error) {
      console.error('Error fetching messages by location:', error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
