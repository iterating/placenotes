import { apiClient } from '../../api/apiClient';
import {
  setMessages,
  addMessage,
  setLoading,
  setError
} from './messageSlice';

export const fetchMessagesByLocation = ({ longitude, latitude, radius, page = 1 }) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const response = await apiClient.get('/messages', {
        params: {
          longitude,
          latitude,
          radius,
          page
        }
      });
      dispatch(setMessages(response.data));
    } catch (error) {
      console.error('Error fetching messages by location:', error);
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const createMessage = (messageData) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const response = await apiClient.post('/messages', messageData);
      dispatch(addMessage(response.data));
      return response.data;
    } catch (error) {
      console.error('Error creating message:', error);
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };
};
