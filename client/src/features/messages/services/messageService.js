import { apiClient } from '../../../api/apiClient';

/**
 * Fetches messages for the current user
 * @param {number} page Page number to fetch
 * @param {number} limit Number of messages per page
 * @returns {Promise} Promise resolving to messages data
 */
export const fetchMessages = async (page = 1, limit = 20) => {
  try {
    const response = await apiClient.get(`/messages/list?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

/**
 * Marks a message as read
 * @param {string} messageId ID of the message to mark as read
 * @returns {Promise} Promise resolving to the updated message
 */
export const markMessageAsRead = async (messageId) => {
  try {
    const response = await apiClient.patch(`/messages/${messageId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

/**
 * Sends a new message
 * @param {Object} messageData Message data to send
 * @returns {Promise} Promise resolving to the sent message
 */
export const sendMessage = async (messageData) => {
  try {
    const response = await apiClient.post('/messages', messageData);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Deletes a message
 * @param {string} messageId ID of the message to delete
 * @returns {Promise} Promise resolving to the deletion result
 */
export const deleteMessage = async (messageId) => {
  try {
    const response = await apiClient.delete(`/messages/${messageId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

/**
 * Fetches message thread - a message and all of its replies
 * @param {string} messageId Root message ID
 * @returns {Promise} Promise resolving to thread data
 */
export const fetchMessageThread = async (messageId) => {
  try {
    const response = await apiClient.get(`/messages/thread/${messageId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching message thread:', error);
    throw error;
  }
};

/**
 * Helper to normalize messages for the store
 * @param {Array} messages Array of message objects
 * @returns {Object} Normalized messages object with IDs as keys
 */
export const normalizeMessages = (messages) => {
  return messages.reduce((acc, message) => {
    acc[message._id] = message;
    return acc;
  }, {});
};
