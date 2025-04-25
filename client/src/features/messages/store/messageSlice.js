import { createSlice } from '@reduxjs/toolkit';
import * as messageService from '../services/messageService';

// Import thunks and selectors from separate files
import {
  fetchMessages,
  sendMessage,
  hideMessage,
  unhideMessage,
  markMessageAsRead,
  fetchMessageThread,
  replyToMessage
} from './messageThunks';

// Re-export all selectors and thunks
export * from './messageSelectors';
export * from './messageThunks';

// Initial state
const initialState = {
  messages: {},             // Normalized messages by ID
  conversations: {},        // Grouped messages by conversationId
  threadMessages: {},       // Messages in a thread keyed by parent message ID
  loading: false,           // Global loading state
  refreshing: false,        // Refresh indicator (doesn't block UI)
  error: null,              // Global error state
  currentPage: 1,           // Current page for pagination
  hasMoreMessages: true,    // Flag to indicate if more messages can be loaded
  selectedMessageId: null,  // Currently selected message
  selectedConversation: null, // Currently selected conversation
  unreadCount: 0,           // Total unread messages count
  pagination: {             // Pagination metadata
    currentPage: 1,
    totalPages: 1,
    totalMessages: 0
  }
};

/**
 * Helper functions for message operations
 */

/**
 * Updates conversation data when a new message is added
 */
const updateConversationWithMessage = (conversations, message) => {
  if (!message || !message.senderId || !message.receiverId) return conversations;
  
  const participants = [message.senderId, message.receiverId].sort().join('-');
  const existingConversation = conversations[participants];
  
  if (!existingConversation) {
    // Create new conversation
    return {
      ...conversations,
      [participants]: {
        id: participants,
        participants: [message.senderId, message.receiverId],
        lastMessage: message,
        messageIds: [message._id],
        unreadCount: message.read ? 0 : 1
      }
    };
  } else {
    // Update existing conversation
    const updatedConversation = { ...existingConversation };
    
    // Add message ID if not already in the list
    if (!updatedConversation.messageIds.includes(message._id)) {
      updatedConversation.messageIds = [...updatedConversation.messageIds, message._id];
    }
    
    // Update last message if newer
    const lastMessageDate = new Date(updatedConversation.lastMessage.createdAt);
    const newMessageDate = new Date(message.createdAt);
    
    if (newMessageDate > lastMessageDate) {
      updatedConversation.lastMessage = message;
    }
    
    // Update unread count
    if (!message.read) {
      updatedConversation.unreadCount += 1;
    }
    
    return {
      ...conversations,
      [participants]: updatedConversation
    };
  }
};

// Helper for normalizing messages in the state
const normalizeMessagesInState = (state, messages, replace = false) => {
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

// Create the slice
const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    // Actions needed by messageStoreAction.js
    setMessages: (state, action) => {
      // Handle both array and paginated response formats
      const messages = Array.isArray(action.payload) 
        ? action.payload 
        : action.payload.messages || [];
      
      // Convert array to normalized object
      const normalized = messageService.normalizeMessages(messages);
      state.messages = normalized;
      
      // Group messages into conversations by participants
      const conversations = {};
      
      // Build conversations from messages
      messages.forEach(message => {
        // Use helper function to update conversations with each message
        Object.assign(conversations, 
          updateConversationWithMessage(conversations, message));
      });
      
      // Update conversation state
      state.conversations = conversations;
      
      // Update pagination if available
      if (action.payload.pagination) {
        state.pagination = action.payload.pagination;
      }
    },
    addMessage: (state, action) => {
      const newMessage = action.payload;
      
      // Add to normalized state
      state.messages[newMessage._id] = newMessage;
      
      // Update unread count
      if (!newMessage.read) {
        state.unreadCount += 1;
      }
      
      // Update conversation using the helper function
      state.conversations = updateConversationWithMessage(state.conversations, newMessage);
      
      // If this is a reply, update thread messages
      if (newMessage.parentMessageId && newMessage.parentMessageId !== newMessage._id) {
        if (!state.threadMessages[newMessage.parentMessageId]) {
          state.threadMessages[newMessage.parentMessageId] = {};
        }
        state.threadMessages[newMessage.parentMessageId][newMessage._id] = newMessage;
      }
    },
    setSelectedMessage: (state, action) => {
      state.selectedMessageId = action.payload;
      
      // If we have participant info, also set the selected conversation
      const message = state.messages[action.payload];
      if (message && message.senderId && message.receiverId) {
        const participants = [message.senderId, message.receiverId].sort().join('-');
        state.selectedConversation = participants;
      }
    },
    clearSelectedMessage: (state) => {
      state.selectedMessageId = null;
      state.selectedConversation = null;
    },
    clearMessageError: (state) => {
      state.error = null;
    },
    resetMessages: (state) => {
      state.messages = {};
      state.conversations = {};
      state.threadMessages = {};
      state.currentPage = 1;
      state.hasMoreMessages = true;
      state.unreadCount = 0;
      state.selectedMessageId = null;
      state.selectedConversation = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch messages handlers
      .addCase(fetchMessages.pending, (state, action) => {
        const { meta } = action;
        const page = meta.arg.page || 1;
        if (page === 1) {
          state.loading = true;
        } else {
          state.refreshing = true;
        }
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
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
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload || 'Failed to fetch messages';
      })
      
      // Send message handlers
      .addCase(sendMessage.pending, (state, action) => {
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
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
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
      })
      .addCase(sendMessage.rejected, (state, action) => {
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
      })
      
      // Mark message as read handlers
      .addCase(markMessageAsRead.pending, (state) => {
        state.refreshing = true;
      })
      .addCase(markMessageAsRead.fulfilled, (state, action) => {
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
      })
      .addCase(markMessageAsRead.rejected, (state, action) => {
        state.refreshing = false;
        // Don't set error state to avoid unnecessary UI errors
        console.error('markMessageAsRead rejected:', action.payload || 'Unknown error');
      })
      
      // Hide message handlers
      .addCase(hideMessage.pending, (state) => {
        state.refreshing = true;
        state.error = null;
      })
      .addCase(hideMessage.fulfilled, (state, action) => {
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
      })
      .addCase(hideMessage.rejected, (state, action) => {
        state.refreshing = false;
        state.error = action.payload || 'Failed to hide message';
      })
      
      // Unhide message handlers
      .addCase(unhideMessage.pending, (state) => {
        state.refreshing = true;
        state.error = null;
      })
      .addCase(unhideMessage.fulfilled, (state, action) => {
        const messageId = action.payload;
        if (messageId && state.messages[messageId]) {
          // Mark the message as not hidden
          state.messages[messageId].hidden = false;
        }
        state.refreshing = false;
      })
      .addCase(unhideMessage.rejected, (state, action) => {
        state.refreshing = false;
        state.error = action.payload || 'Failed to unhide message';
      })
      
      // Fetch message thread handlers
      .addCase(fetchMessageThread.pending, (state) => {
        state.refreshing = true;
        state.error = null;
      })
      .addCase(fetchMessageThread.fulfilled, (state, action) => {
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
      })
      .addCase(fetchMessageThread.rejected, (state, action) => {
        state.refreshing = false;
        state.error = action.payload || 'Failed to fetch message thread';
      })
      
      // Reply to message handlers
      .addCase(replyToMessage.pending, (state) => {
        state.refreshing = true;
        state.error = null;
        
        // Create optimistic UI update handled in sendMessage handlers
        // since we reuse the same endpoint
      })
      .addCase(replyToMessage.fulfilled, (state, action) => {
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
      })
      .addCase(replyToMessage.rejected, (state, action) => {
        state.refreshing = false;
        state.error = action.payload || 'Failed to reply to message';
      });
  },
});

// Export actions
export const { 
  setMessages,
  addMessage,
  setSelectedMessage, 
  clearSelectedMessage,
  clearMessageError,
  resetMessages
} = messageSlice.actions;

// Export the slice reducer as default
export default messageSlice.reducer;
