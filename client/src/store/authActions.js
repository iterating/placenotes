import { createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../api/apiClient';

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/users/signup', userData);
      
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      
      return {
        user: response.data.user,
        token: response.data.token
      };
    } catch (error) {
      console.error('Registration error:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Registration failed'
      );
    }
  }
);
