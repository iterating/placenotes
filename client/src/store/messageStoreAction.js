import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../api/apiClient';
import { setMessages, addMessage, markAsRead } from './messageSlice';

// Utility to validate and format the location coordinates
const validateLocation = (location) => {
  if (!location || !location.coordinates || location.coordinates.length !== 2) {
    throw new Error('Invalid location coordinates. Must contain latitude and longitude.');
  }
  
  const [longitude, latitude] = location.coordinates;
  
  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error('Invalid latitude or longitude values.');
  }

  return {
    type: 'Point',
    coordinates: [longitude, latitude],
  };
};

// Fetch all messages for the current user
export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await apiClient.get('/message/list');
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
      const formattedData = {
        recipientId: messageData.recipientId,
        content: messageData.content.trim(),
        location: validateLocation(messageData.location),
        radius: Number(messageData.radius) || 1000
      };

      const response = await apiClient.post('/message/create', formattedData);
      dispatch(addMessage(response.data));
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      return rejectWithValue(error.response?.data?.message || 'Error sending message');
    }
  }
);

// Mark message as read
export const markMessageAsRead = createAsyncThunk(
  'messages/markAsRead',
  async (messageId, { dispatch, rejectWithValue }) => {
    try {
      await apiClient.put(`/message/${messageId}/read`);
      dispatch(markAsRead(messageId));
    } catch (error) {
      console.error('Error marking message as read:', error);
      return rejectWithValue(error.response?.data?.message || 'Error marking message as read');
    }
  }
);

// Fetch messages by location
export const fetchMessagesByLocation = createAsyncThunk(
  'messages/fetchByLocation',
  async ({ location, radius }, { dispatch, rejectWithValue }) => {
    try {
      const validatedLocation = validateLocation(location);
      const response = await apiClient.get('/message/nearby', {
        params: {
          longitude: validatedLocation.coordinates[0],
          latitude: validatedLocation.coordinates[1],
          radius: radius || 1000
        }
      });
      dispatch(setMessages(response.data));
      return response.data;
    } catch (error) {
      console.error('Error fetching messages by location:', error);
      return rejectWithValue(error.response?.data?.message || 'Error fetching messages by location');
    }
  }
);
