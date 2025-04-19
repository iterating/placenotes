/**
 * Redux reducers handlers for message slice
 * This file contains the reducer handlers for different async thunk actions
 */

// Helper for normalizing messages in the state
export const normalizeMessagesInState = (state, messages, replace = false) => {
  const normalized = messages.reduce((acc, message) => {
    acc[message._id] = message;
    return acc;
  }, {});
  
  if (replace) {
    state.messages = normalized;
  } else {
    state.messages = { ...state.messages, ...normalized };
  }
};

// Fetch messages handlers
export const fetchMessagesHandlers = {
  pending: (state, action) => {
    const { meta } = action;
    const page = meta.arg.page || 1;
    if (page === 1) {
      state.loading = true;
    } else {
      state.refreshing = true;
    }
    state.error = null;
  },
  
  fulfilled: (state, action) => {
    const { meta, payload } = action;
    const page = meta.arg.page || 1;
    const messages = payload.messages || [];
    
    // If page 1, replace messages, otherwise merge
    normalizeMessagesInState(state, messages, page === 1);
    
    // Update state properties
    state.currentPage = page;
    state.hasMoreMessages = messages.length > 0;
    state.loading = false;
    state.refreshing = false;
    state.error = null;
    
    // Update pagination if available
    if (payload.pagination) {
      state.pagination = payload.pagination;
    }
    
    // Update unread count
    state.unreadCount = Object.values(state.messages)
      .filter(msg => !msg.read && !msg.hidden).length;
  },
  
  rejected: (state, action) => {
    state.loading = false;
    state.refreshing = false;
    state.error = action.payload || 'Failed to fetch messages';
  }
};

// Send message handlers
export const sendMessageHandlers = {
  pending: (state, action) => {
    state.loading = true;
    state.error = null;
    
    // Create a temporary message for optimistic UI update
    if (action.meta?.arg) {
      const tempMessage = {
        _id: `temp_${Date.now()}`,
        content: action.meta.arg.content,
        senderId: action.meta.arg.senderId || 'current_user',
        recipientId: action.meta.arg.recipientId,
        parentMessageId: action.meta.arg.parentMessageId || null,
        conversationId: action.meta.arg.conversationId || null,
        location: action.meta.arg.location || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        read: true, // Messages sent by the user are always read
        pending: true, // Mark as pending
        tempId: `temp_${Date.now()}` // Store temp ID for later reference
      };
      
      // Add to messages store
      state.messages[tempMessage._id] = tempMessage;
      
      // If this is a reply, add it to the thread
      if (tempMessage.parentMessageId && state.threadMessages[tempMessage.parentMessageId]) {
        state.threadMessages[tempMessage.parentMessageId][tempMessage._id] = tempMessage;
      }
      
      // Store the temp ID in the meta for reference in fulfilled/rejected
      action.meta.tempId = tempMessage._id;
    }
  },
  
  fulfilled: (state, action) => {
    state.loading = false;
    
    // Get the real message from the server
    const message = action.payload;
    
    // Find and remove the temporary message if it exists
    const tempId = action.meta.tempId;
    if (tempId && state.messages[tempId]) {
      // Remove the temp message
      delete state.messages[tempId];
      
      // Remove from thread if it was added there
      if (message.parentMessageId && 
          state.threadMessages[message.parentMessageId] && 
          state.threadMessages[message.parentMessageId][tempId]) {
        delete state.threadMessages[message.parentMessageId][tempId];
      }
    }
    
    // Add the confirmed message to our normalized store
    state.messages[message._id] = {
      ...message,
      pending: false,
      sendFailed: false
    };
    
    // If this is a reply, add it to the thread
    if (message.parentMessageId && state.threadMessages[message.parentMessageId]) {
      state.threadMessages[message.parentMessageId][message._id] = {
        ...message,
        pending: false,
        sendFailed: false
      };
    }
    
    // Add to conversation if it exists
    if (message.conversationId && state.conversations[message.conversationId]) {
      // Make sure we don't add duplicates
      if (!state.conversations[message.conversationId].messageIds.includes(message._id)) {
        state.conversations[message.conversationId].messageIds.push(message._id);
      }
      state.conversations[message.conversationId].lastMessage = message;
      state.conversations[message.conversationId].updatedAt = message.createdAt;
    }
  },
  
  rejected: (state, action) => {
    state.loading = false;
    state.error = action.payload || 'Failed to send message';
    
    // Find the temporary message and mark it as failed
    const tempId = action.meta.tempId;
    if (tempId && state.messages[tempId]) {
      state.messages[tempId] = {
        ...state.messages[tempId],
        pending: false,
        sendFailed: true,
        errorMessage: action.payload || 'Failed to send message'
      };
      
      // Update in thread if it exists there
      if (state.messages[tempId].parentMessageId && 
          state.threadMessages[state.messages[tempId].parentMessageId] && 
          state.threadMessages[state.messages[tempId].parentMessageId][tempId]) {
        
        state.threadMessages[state.messages[tempId].parentMessageId][tempId] = {
          ...state.threadMessages[state.messages[tempId].parentMessageId][tempId],
          pending: false,
          sendFailed: true,
          errorMessage: action.payload || 'Failed to send message'
        };
      }
    }
  }
};

// Mark message as read handlers
export const markMessageAsReadHandlers = {
  pending: (state) => {
    state.refreshing = true;
  },
  
  fulfilled: (state, action) => {
    const { messageId, success } = action.payload;
    state.refreshing = false;
    
    // Skip updates if not successful
    if (!success) return;
    
    // Update in messages map
    if (state.messages[messageId]) {
      state.messages[messageId].read = true;
    }
    
    // Update unread count
    state.unreadCount = Math.max(0, state.unreadCount - 1);
    
    // Update in thread messages if it exists there
    Object.keys(state.threadMessages).forEach(threadId => {
      if (state.threadMessages[threadId][messageId]) {
        state.threadMessages[threadId][messageId].read = true;
      }
    });
  },
  
  rejected: (state, action) => {
    state.refreshing = false;
    // Don't set error state to avoid unnecessary UI errors
    console.error('markMessageAsRead rejected:', action.payload || 'Unknown error');
  }
};

// Hide message handlers
export const hideMessageHandlers = {
  pending: (state) => {
    state.refreshing = true;
    state.error = null;
  },
  
  fulfilled: (state, action) => {
    const messageId = action.payload;
    if (messageId && state.messages[messageId]) {
      // Mark the message as hidden
      state.messages[messageId].hidden = true;
      
      // If this message is currently selected, clear the selection
      if (state.selectedMessageId === messageId) {
        state.selectedMessageId = null;
      }
    }
    state.refreshing = false;
  },
  
  rejected: (state, action) => {
    state.refreshing = false;
    state.error = action.payload || 'Failed to hide message';
  }
};

// Unhide message handlers
export const unhideMessageHandlers = {
  pending: (state) => {
    state.refreshing = true;
    state.error = null;
  },
  
  fulfilled: (state, action) => {
    const messageId = action.payload;
    if (messageId && state.messages[messageId]) {
      // Mark the message as not hidden
      state.messages[messageId].hidden = false;
    }
    state.refreshing = false;
  },
  
  rejected: (state, action) => {
    state.refreshing = false;
    state.error = action.payload || 'Failed to unhide message';
  }
};

// Fetch message thread handlers
export const fetchMessageThreadHandlers = {
  pending: (state) => {
    state.refreshing = true;
    state.error = null;
  },
  
  fulfilled: (state, action) => {
    const { threadId, rootMessage, replies, allMessages } = action.payload;
    
    // First, ensure the root message is in our messages store
    if (rootMessage && rootMessage._id) {
      state.messages[rootMessage._id] = rootMessage;
    }
    
    // Add all replies to the messages store
    if (replies && replies.length > 0) {
      replies.forEach(reply => {
        if (reply && reply._id) {
          state.messages[reply._id] = reply;
        }
      });
    }
    
    // Create the thread mapping
    if (threadId) {
      // Create a normalized object of reply messages
      const normalizedReplies = replies.reduce((acc, reply) => {
        acc[reply._id] = reply;
        return acc;
      }, {});
      
      // Store in the threadMessages
      state.threadMessages[threadId] = normalizedReplies;
    }
    
    state.refreshing = false;
  },
  
  rejected: (state, action) => {
    state.refreshing = false;
    state.error = action.payload || 'Failed to fetch message thread';
  }
};

// Reply to message handlers
export const replyToMessageHandlers = {
  pending: (state) => {
    state.refreshing = true;
    state.error = null;
    
    // Create optimistic UI update handled in sendMessage handlers
    // since we reuse the same endpoint
  },
  
  fulfilled: (state, action) => {
    const { parentMessageId, replyMessage, success } = action.payload;
    state.refreshing = false;
    
    if (!success || !replyMessage || !parentMessageId) return;
    
    // Add the reply to the messages store if not already there
    if (replyMessage._id && !state.messages[replyMessage._id]) {
      state.messages[replyMessage._id] = {
        ...replyMessage,
        pending: false,
        sendFailed: false
      };
    }
    
    // Make sure we have a thread structure for this parent
    if (!state.threadMessages[parentMessageId]) {
      state.threadMessages[parentMessageId] = {};
    }
    
    // Add the reply to the thread
    if (replyMessage._id) {
      state.threadMessages[parentMessageId][replyMessage._id] = {
        ...replyMessage,
        pending: false,
        sendFailed: false
      };
    }
  },
  
  rejected: (state, action) => {
    state.refreshing = false;
    state.error = action.payload || 'Failed to reply to message';
  }
};
