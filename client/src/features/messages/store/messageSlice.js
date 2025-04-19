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

// Import reducer handlers
import {
  fetchMessagesHandlers,
  sendMessageHandlers,
  markMessageAsReadHandlers,
  hideMessageHandlers,
  unhideMessageHandlers,
  fetchMessageThreadHandlers,
  replyToMessageHandlers
} from './reducerHandlers';

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

/**
 * Calculates total unread messages count
 */
const calculateUnreadCount = (messages) => {
  return Object.values(messages)
    .filter(msg => !msg.read && !msg.hidden).length;
};

// Create the slice
const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    // Actions needed by messageStoreAction.js
    hideMessageById(state, action) {
      const messageId = action.payload;
      if (messageId && state.messages[messageId]) {
        // Mark the message as hidden
        state.messages[messageId].hidden = true;
        
        // If this message is currently selected, clear the selection
        if (state.selectedMessageId === messageId) {
          state.selectedMessageId = null;
        }
      }
    },
    
    unhideMessageById(state, action) {
      const messageId = action.payload;
      if (messageId && state.messages[messageId]) {
        // Mark the message as not hidden
        state.messages[messageId].hidden = false;
      }
    },
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
      
      // Update total unread count using helper function
      state.unreadCount = calculateUnreadCount(state.messages);
      
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
    markAsRead: (state, action) => {
      const messageId = action.payload;
      const message = state.messages[messageId];
      
      if (message && !message.read) {
        // Mark the message as read
        message.read = true;
        
        // Update global unread count
        state.unreadCount = Math.max(0, state.unreadCount - 1);
        
        // Update conversation unread count
        if (message.senderId && message.receiverId) {
          const participants = [message.senderId, message.receiverId].sort().join('-');
          if (state.conversations[participants]) {
            state.conversations[participants].unreadCount = 
              Math.max(0, state.conversations[participants].unreadCount - 1);
          }
        }
        
        // If this message is in a thread, update thread status
        if (message.parentMessageId && 
            state.threadMessages[message.parentMessageId] && 
            state.threadMessages[message.parentMessageId][message._id]) {
          state.threadMessages[message.parentMessageId][message._id].read = true;
        }
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
    updateUnreadCount: (state) => {
      // Calculate unread count based on messages using the helper function
      state.unreadCount = calculateUnreadCount(state.messages);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch messages handlers
      .addCase(fetchMessages.pending, fetchMessagesHandlers.pending)
      .addCase(fetchMessages.fulfilled, fetchMessagesHandlers.fulfilled)
      .addCase(fetchMessages.rejected, fetchMessagesHandlers.rejected)
      
      // Send message handlers
      .addCase(sendMessage.pending, sendMessageHandlers.pending)
      .addCase(sendMessage.fulfilled, sendMessageHandlers.fulfilled)
      .addCase(sendMessage.rejected, sendMessageHandlers.rejected)
      
      // Mark message as read handlers
      .addCase(markMessageAsRead.pending, markMessageAsReadHandlers.pending)
      .addCase(markMessageAsRead.fulfilled, markMessageAsReadHandlers.fulfilled)
      .addCase(markMessageAsRead.rejected, markMessageAsReadHandlers.rejected)
      
      // Hide message handlers
      .addCase(hideMessage.pending, hideMessageHandlers.pending)
      .addCase(hideMessage.fulfilled, hideMessageHandlers.fulfilled)
      .addCase(hideMessage.rejected, hideMessageHandlers.rejected)
      
      // Unhide message handlers
      .addCase(unhideMessage.pending, unhideMessageHandlers.pending)
      .addCase(unhideMessage.fulfilled, unhideMessageHandlers.fulfilled)
      .addCase(unhideMessage.rejected, unhideMessageHandlers.rejected)
      
      // Fetch message thread handlers
      .addCase(fetchMessageThread.pending, fetchMessageThreadHandlers.pending)
      .addCase(fetchMessageThread.fulfilled, fetchMessageThreadHandlers.fulfilled)
      .addCase(fetchMessageThread.rejected, fetchMessageThreadHandlers.rejected)
      
      // Reply to message handlers
      .addCase(replyToMessage.pending, replyToMessageHandlers.pending)
      .addCase(replyToMessage.fulfilled, replyToMessageHandlers.fulfilled)
      .addCase(replyToMessage.rejected, replyToMessageHandlers.rejected);
  },
});

// Export actions
export const { 
  setMessages,
  addMessage,
  markAsRead,
  hideMessageById,
  unhideMessageById,
  setSelectedMessage, 
  clearSelectedMessage,
  clearMessageError,
  resetMessages,
  updateUnreadCount
} = messageSlice.actions;

// Export the slice reducer as default
export default messageSlice.reducer;
