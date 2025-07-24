import apiClient from './apiClient';

const API_URL = '/users';

export const searchUsers = async (email) => {
  try {
    const response = await apiClient.get(`${API_URL}/search`, {
      params: { email }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

export const sendFriendRequest = async (targetUserId) => {
  try {
    const response = await apiClient.post(`${API_URL}/friend-request`, {
      targetUserId
    });
    return response.data;
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
};
