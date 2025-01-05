import axios from 'axios';

const API_URL = '/api/users';

export const searchUsers = async (email) => {
  try {
    const response = await axios.get(`${API_URL}/search`, {
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
    const response = await axios.post(`${API_URL}/friend-request`, {
      targetUserId
    });
    return response.data;
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
};
