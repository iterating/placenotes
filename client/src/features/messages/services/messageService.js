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
 * @returns {Promise} Promise resolving with success status
 */
export const markMessageAsRead = async (messageId) => {
  try {
    
    try {
      // Try server first for real messages
      const response = await apiClient.put(`/messages/${messageId}/read`);
      return { success: true, messageId };
    } catch (serverError) {
      // Handle different error types appropriately
      if (serverError.response && serverError.response.status === 403) {
        // This is expected when the user is the sender - silently handle it
        return { success: true, messageId, clientSide: true };
      } else if (serverError.response && serverError.response.status === 404) {
        // Message not found - silently handle it
        return { success: true, messageId, clientSide: true };
      } else {
        // For other errors, log them but still return success for UI
        console.warn('Error marking message as read:', serverError.message);
        return { success: true, messageId, clientSide: true };
      }
    }
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
    // Validate message data before sending
    if (!messageData.content || messageData.content.trim() === '') {
      throw new Error('Message content cannot be empty');
    }
    
    if (!messageData.recipientId) {
      throw new Error('Recipient is required');
    }
    
    // Try to send the message
    try {
      const response = await apiClient.post('/create', messageData);
      return {
        ...response.data,
        success: true
      };
    } catch (serverError) {
      // Handle different server error types
      if (!navigator.onLine) {
        throw new Error('You appear to be offline. Please check your internet connection and try again.');
      }
      
      if (serverError.response) {
        // Server responded with an error status
        const status = serverError.response.status;
        const errorMessage = serverError.response.data?.message || 'Unknown server error';
        
        if (status === 401) {
          throw new Error('You must be logged in to send messages');
        } else if (status === 403) {
          throw new Error('You do not have permission to send this message');
        } else if (status === 404) {
          throw new Error('The recipient could not be found');
        } else if (status === 422) {
          throw new Error(`Invalid message data: ${errorMessage}`);
        } else {
          throw new Error(`Server error: ${errorMessage}`);
        }
      } else if (serverError.request) {
        // Request was made but no response received
        throw new Error('No response from server. Please try again later.');
      } else {
        // Something else happened while setting up the request
        throw new Error(`Error sending message: ${serverError.message}`);
      }
    }
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Hides a message (updates server and client)
 * @param {string} messageId ID of the message to hide
 * @returns {Promise} Promise that resolves when message is hidden
 */
export const hideMessage = async (messageId) => {
  try {
    // Send request to server to update the message's hidden status
    try {
      // The apiClient baseURL is already set to http://localhost:5000/api
      // The server mounts message routes at /api/messages
      // So we need to use the correct path structure
      const response = await apiClient.put(`/messages/${messageId}/hidden`, { hidden: true });
      return response.data.messageId;
    } catch (serverError) {
      // Handle different error types appropriately
      if (serverError.response && serverError.response.status === 403) {
        // User doesn't have permission
        throw new Error('You do not have permission to hide this message');
      } else if (serverError.response && serverError.response.status === 404) {
        // Message not found
        throw new Error('Message not found. It may have been deleted.');
      } else {
        // For other errors
        console.warn('Error hiding message on server:', serverError.message);
        throw new Error('Failed to hide message. Please try again later.');
      }
    }
  } catch (error) {
    console.error('Error hiding message:', error);
    throw error;
  }
};

/**
 * Unhides a message (updates server and client)
 * @param {string} messageId ID of the message to unhide
 * @returns {Promise} Promise that resolves when message is unhidden
 */
export const unhideMessage = async (messageId) => {
  try {
    // Send request to server to update the message's hidden status
    try {
      // The apiClient baseURL is already set to http://localhost:5000/api
      // The server mounts message routes at /api/messages
      const response = await apiClient.put(`/messages/${messageId}/hidden`, { hidden: false });
      return response.data.messageId;
    } catch (serverError) {
      // Handle different error types appropriately
      if (serverError.response && serverError.response.status === 403) {
        // User doesn't have permission
        throw new Error('You do not have permission to unhide this message');
      } else if (serverError.response && serverError.response.status === 404) {
        // Message not found
        throw new Error('Message not found. It may have been deleted.');
      } else {
        // For other errors
        console.warn('Error unhiding message on server:', serverError.message);
        throw new Error('Failed to unhide message. Please try again later.');
      }
    }
  } catch (error) {
    console.error('Error unhiding message:', error);
    throw error;
  }
};

/**
 * Mock data generator for thread testing
 * @param {string} messageId The ID to use for the mock message
 * @returns {Object} A mock message object
 */
const createMockMessage = (messageId) => ({
  _id: messageId,
  content: 'This is a test message with mock content for development',
  createdAt: new Date().toISOString(),
  senderId: '123456789012',
  senderName: 'Test User',
  sender: {
    _id: '123456789012',
    username: 'testuser',
    name: 'Test User',
    email: 'test@example.com'
  },
  read: true,
  hidden: false
});



/**
 * Fetches a message thread by ID (original message + all replies)
 * @param {string} messageId ID of the message (thread starter)
 * @returns {Promise} Promise resolving to thread data
 */
export const fetchMessageThread = async (messageId) => {
  try {
    // Validate message ID
    if (!messageId || typeof messageId !== 'string' || messageId.trim() === '') {
      console.error('fetchMessageThread called with invalid messageId:', messageId);
      throw new Error('Invalid message ID');
    }
    
    console.log(`Fetching message thread for ID: ${messageId}`);
    
    // Check for network connectivity
    if (!navigator.onLine) {
      throw new Error('You appear to be offline. Please check your internet connection.');
    }
    
    // Try to fetch from server
    try {
      // First get the original message
      let originalMessage = null;
      try {
        const messageResponse = await apiClient.get(`/messages/${messageId}`);
        originalMessage = messageResponse.data;
        
        if (!originalMessage) {
          throw new Error('Message not found');
        }
        
        // Ensure the message has all required fields
        if (!originalMessage._id) {
          originalMessage._id = messageId;
        }
      } catch (rootMessageError) {
        console.error('Error fetching root message:', rootMessageError);
        throw new Error('Could not load the original message. It may have been deleted.');
      }
      
      // Then get replies to this message
      let replies = [];
      try {
        const repliesResponse = await apiClient.get(`/messages/replies/${messageId}`);
        
        if (repliesResponse && repliesResponse.data) {
          // Ensure replies is an array
          if (Array.isArray(repliesResponse.data)) {
            replies = repliesResponse.data;
          } else if (typeof repliesResponse.data === 'object') {
            // Handle case where API returns an object with replies property
            replies = Array.isArray(repliesResponse.data.replies) ? 
              repliesResponse.data.replies : [];
          } else {
            console.warn('Unexpected replies format:', repliesResponse.data);
            replies = [];
          }
          
          // Validate each reply and ensure it has required fields
          replies = replies
            .filter(reply => reply && typeof reply === 'object') // Filter out invalid replies
            .map(reply => ({
              ...reply,
              _id: reply._id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              parentMessageId: reply.parentMessageId || messageId,
              content: reply.content || '',
              createdAt: reply.createdAt || new Date().toISOString()
            }));
        }
      } catch (repliesError) {
        // Don't fail the entire thread load if replies can't be fetched
        console.warn('Error fetching replies:', repliesError);
        // Continue with empty replies array
      }
      
      // Sort replies by creation date with error handling
      try {
        replies.sort((a, b) => {
          try {
            return new Date(a.createdAt) - new Date(b.createdAt);
          } catch (dateError) {
            console.warn('Error comparing dates:', dateError, a, b);
            return 0; // Keep original order if date comparison fails
          }
        });
      } catch (sortError) {
        console.warn('Error sorting replies:', sortError);
        // Continue with unsorted replies
      }
      
      // Combine them into a thread object
      return {
        rootMessage: originalMessage,
        replies: replies,
        allMessages: [originalMessage, ...replies]
      };
    } catch (serverError) {
      // Handle different server error types
      if (serverError.response) {
        // Server responded with an error status
        const status = serverError.response.status;
        const errorMessage = serverError.response.data?.message || 'Unknown server error';
        
        if (status === 401) {
          throw new Error('You must be logged in to view this message');
        } else if (status === 403) {
          throw new Error('You do not have permission to view this message');
        } else if (status === 404) {
          throw new Error('Message not found. It may have been deleted.');
        } else {
          throw new Error(`Server error: ${errorMessage}`);
        }
      } else if (serverError.request) {
        // Request was made but no response received
        throw new Error('No response from server. Please try again later.');
      } else {
        // Something else happened while setting up the request
        throw new Error(`Error fetching message thread: ${serverError.message}`);
      }
    }
  } catch (error) {
    console.error('Error in fetchMessageThread:', error);
    throw error;
  }
};

/**
 * Helper to normalize messages for the store
 * @param {Array} messages Array of message objects
 * @returns {Object} Normalized messages object with IDs as keys
 */
/**
 * Replies to a message in a thread
 * @param {string} parentMessageId ID of the message being replied to
 * @param {Object} replyData Reply message data (content, recipient, etc.)
 * @returns {Promise} Promise resolving to the sent reply message
 */
export const replyToMessage = async (parentMessageId, replyData) => {
  try {
    // Validate reply data
    if (!replyData.content || replyData.content.trim() === '') {
      throw new Error('Reply content cannot be empty');
    }
    
    if (!replyData.recipientId) {
      throw new Error('Recipient is required');
    }
    
    if (!parentMessageId) {
      throw new Error('Parent message ID is required');
    }
    
    // Create the full message data with parentMessageId
    const messageData = {
      ...replyData,
      parentMessageId
    };
    
    // Use the existing sendMessage endpoint to send the reply
    const response = await apiClient.post('/messages/create', messageData);
    
    return {
      ...response.data,
      success: true,
      parentMessageId
    };
  } catch (error) {
    console.error('Error sending reply:', error);
    throw error;
  }
};

export const normalizeMessages = (messages) => {
  return messages.reduce((acc, message) => {
    acc[message._id] = message;
    return acc;
  }, {});
};
