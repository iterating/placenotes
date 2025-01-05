import apiClient from './apiClient';
import { SERVER } from '../app/config';

export const login = async (credentials) => {
  try {
    const response = await apiClient.post(`${SERVER}/api/users/login`, credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const signup = async (userData) => {
  try {
    const response = await apiClient.post(`${SERVER}/api/users/signup`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await apiClient.put(`${SERVER}/api/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};
