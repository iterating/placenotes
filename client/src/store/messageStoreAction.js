import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../api/apiClient';
import { setMessages, addMessage, markAsRead, deleteMessageById } from './messageSlice';

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
      const formattedData = {
        recipientId: messageData.recipientId,
        content: messageData.content.trim(),
        location: validateLocation(messageData.location),
        radius: Number(messageData.radius) || 1000,
        parentMessageId: messageData.parentMessageId || null // Add parentMessageId for replies
      };

      const response = await apiClient.post('/messages/create', formattedData);
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
  async ({ location, radius, page = 1 }, { dispatch, rejectWithValue }) => {
    try {
      const validatedLocation = validateLocation(location);
      const response = await apiClient.get('/messages/nearby', {
        params: {
          longitude: validatedLocation.coordinates[0],
          latitude: validatedLocation.coordinates[1],
          radius: radius || 1000,
          page
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

// Delete a message
export const deleteMessage = createAsyncThunk(
  'messages/deleteMessage',
  async (messageId, { dispatch, rejectWithValue }) => {
    try {
      await apiClient.delete(`/messages/${messageId}`);
      dispatch(deleteMessageById(messageId));
      return { success: true, messageId };
    } catch (error) {
      console.error('Error deleting message:', error);
      return rejectWithValue(error.response?.data?.message || 'Error deleting message');
    }
  }
);
