import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import * as messageService from '../services/messageService';

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

// Async thunks
export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async ({ page = 1, limit = 20, location = null, radius = null } = {}, { rejectWithValue }) => {
    try {
      let response;
      
      if (location) {
        // If location is provided, fetch messages near that location
        response = await messageService.fetchMessages(page, limit, location, radius);
      } else {
        // Otherwise fetch all messages for the user
        response = await messageService.fetchMessages(page, limit);
      }
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await messageService.sendMessage(messageData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to send message');
    }
  }
);

export const deleteMessage = createAsyncThunk(
  'messages/deleteMessage',
  async (messageId, { rejectWithValue }) => {
    try {
      await messageService.deleteMessage(messageId);
      return messageId;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete message');
    }
  }
);

export const markMessageAsRead = createAsyncThunk(
  'messages/markAsRead',
  async (messageId, { rejectWithValue }) => {
    try {
      const response = await messageService.markMessageAsRead(messageId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to mark message as read');
    }
  }
);

export const fetchMessageThread = createAsyncThunk(
  'messages/fetchThread',
  async (messageId, { rejectWithValue }) => {
    try {
      const response = await messageService.fetchMessageThread(messageId);
      return { threadId: messageId, messages: response };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch message thread');
    }
  }
);

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
      // A conversation is defined by the pair of users communicating
      const conversations = {};
      
      messages.forEach(message => {
        // Create a unique key for each conversation based on the participants
        // Sort participant IDs to ensure the same conversation key regardless of sender/receiver
        const participants = [message.senderId, message.receiverId].sort().join('-');
        
        if (!conversations[participants]) {
          conversations[participants] = {
            id: participants,
            participants: [message.senderId, message.receiverId],
            lastMessage: message,
            messageIds: [],
            unreadCount: 0
          };
        }
        
        // Add message ID to the conversation
        if (!conversations[participants].messageIds.includes(message._id)) {
          conversations[participants].messageIds.push(message._id);
        }
        
        // Update last message and unread count
        const lastMsgDate = new Date(conversations[participants].lastMessage.createdAt);
        const currentMsgDate = new Date(message.createdAt);
        
        if (currentMsgDate > lastMsgDate) {
          conversations[participants].lastMessage = message;
        }
        
        // Count unread messages
        if (!message.read) {
          conversations[participants].unreadCount++;
        }
      });
      
      // Update conversation state
      state.conversations = conversations;
      
      // Update total unread count
      state.unreadCount = messages.filter(msg => !msg.read).length;
      
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
      
      // Update conversation
      const participants = [newMessage.senderId, newMessage.receiverId].sort().join('-');
      
      // Create conversation if it doesn't exist
      if (!state.conversations[participants]) {
        state.conversations[participants] = {
          id: participants,
          participants: [newMessage.senderId, newMessage.receiverId],
          lastMessage: newMessage,
          messageIds: [newMessage._id],
          unreadCount: newMessage.read ? 0 : 1
        };
      } else {
        // Update existing conversation
        const conversation = state.conversations[participants];
        
        // Add message ID if not already in the list
        if (!conversation.messageIds.includes(newMessage._id)) {
          conversation.messageIds.push(newMessage._id);
        }
        
        // Update last message if newer
        const lastMessageDate = new Date(conversation.lastMessage.createdAt);
        const newMessageDate = new Date(newMessage.createdAt);
        
        if (newMessageDate > lastMessageDate) {
          conversation.lastMessage = newMessage;
        }
        
        // Update unread count
        if (!newMessage.read) {
          conversation.unreadCount += 1;
        }
      }
      
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
    deleteMessageById: (state, action) => {
      const messageId = action.payload;
      const message = state.messages[messageId];
      
      if (!message) return;
      
      const messageWasUnread = !message.read;
      
      // Update conversation
      if (message.senderId && message.receiverId) {
        const participants = [message.senderId, message.receiverId].sort().join('-');
        const conversation = state.conversations[participants];
        
        if (conversation) {
          // Remove message from conversation
          conversation.messageIds = conversation.messageIds.filter(id => id !== messageId);
          
          // Update unread count
          if (messageWasUnread) {
            conversation.unreadCount = Math.max(0, conversation.unreadCount - 1);
          }
          
          // Update last message if this was the last message
          if (conversation.lastMessage._id === messageId) {
            // Find the new last message
            const lastMessageId = conversation.messageIds.length > 0 ? 
              conversation.messageIds[conversation.messageIds.length - 1] : null;
              
            if (lastMessageId && state.messages[lastMessageId]) {
              conversation.lastMessage = state.messages[lastMessageId];
            } else {
              // No messages left in conversation
              delete state.conversations[participants];
            }
          }
        }
      }
      
      // If this message is in a thread, remove it
      if (message.parentMessageId && 
          state.threadMessages[message.parentMessageId]) {
        delete state.threadMessages[message.parentMessageId][messageId];
        
        // If thread is now empty, remove it
        if (Object.keys(state.threadMessages[message.parentMessageId]).length === 0) {
          delete state.threadMessages[message.parentMessageId];
        }
      }
      
      // If this message has replies, remove all thread messages
      if (state.threadMessages[messageId]) {
        delete state.threadMessages[messageId];
      }
      
      // Remove the message from normalized state
      const { [messageId]: deletedMessage, ...remainingMessages } = state.messages;
      state.messages = remainingMessages;
      
      // Update unread count if needed
      if (messageWasUnread) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      
      // If deleted message was selected, clear selection
      if (state.selectedMessageId === messageId) {
        state.selectedMessageId = null;
      }
    },
    
    // Original actions
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
      // Calculate unread count based on messages
      state.unreadCount = Object.values(state.messages)
        .filter(msg => !msg.read).length;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch messages
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
        
        // Normalize the messages and add to state
        const normalizedMessages = messageService.normalizeMessages(payload.messages || []);
        
        // If page 1, replace messages, otherwise merge
        if (page === 1) {
          state.messages = normalizedMessages;
        } else {
          state.messages = { ...state.messages, ...normalizedMessages };
        }
        
        state.currentPage = page;
        state.hasMoreMessages = payload.messages.length > 0;
        state.loading = false;
        state.refreshing = false;
        state.error = null;
        
        // Update pagination if available
        if (payload.pagination) {
          state.pagination = payload.pagination;
        }
        
        // Update unread count
        state.unreadCount = Object.values(state.messages)
          .filter(msg => !msg.read).length;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload || 'Failed to fetch messages';
      })
      
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.refreshing = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const newMessage = action.payload;
        state.messages[newMessage._id] = newMessage;
        state.refreshing = false;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.refreshing = false;
        state.error = action.payload || 'Failed to send message';
      })
      
      // Delete message
      .addCase(deleteMessage.pending, (state) => {
        state.refreshing = true;
        state.error = null;
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        const messageId = action.payload;
        const messageWasUnread = state.messages[messageId] && !state.messages[messageId].read;
        
        // Remove the message from state
        const { [messageId]: deletedMessage, ...remainingMessages } = state.messages;
        state.messages = remainingMessages;
        state.refreshing = false;
        
        // Update unread count if necessary
        if (messageWasUnread) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        
        // If deleted message was selected, clear selection
        if (state.selectedMessageId === messageId) {
          state.selectedMessageId = null;
        }
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.refreshing = false;
        state.error = action.payload || 'Failed to delete message';
      })
      
      // Mark message as read
      .addCase(markMessageAsRead.fulfilled, (state, action) => {
        const updatedMessage = action.payload;
        const wasUnread = state.messages[updatedMessage._id] && !state.messages[updatedMessage._id].read;
        
        // Update the message in state
        state.messages[updatedMessage._id] = {
          ...state.messages[updatedMessage._id],
          ...updatedMessage
        };
        
        // Update unread count if necessary
        if (wasUnread) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      
      // Fetch message thread
      .addCase(fetchMessageThread.pending, (state) => {
        state.refreshing = true;
        state.error = null;
      })
      .addCase(fetchMessageThread.fulfilled, (state, action) => {
        const { threadId, messages } = action.payload;
        state.threadMessages[threadId] = messageService.normalizeMessages(messages);
        state.refreshing = false;
      })
      .addCase(fetchMessageThread.rejected, (state, action) => {
        state.refreshing = false;
        state.error = action.payload || 'Failed to fetch message thread';
      });
  },
});

// Export actions
export const { 
  setMessages,
  addMessage,
  markAsRead,
  deleteMessageById,
  setSelectedMessage, 
  clearSelectedMessage,
  clearMessageError,
  resetMessages,
  updateUnreadCount
} = messageSlice.actions;

// Selectors
export const selectAllMessages = (state) => Object.values(state.messages.messages);
export const selectMessages = (state) => Object.values(state.messages.messages); // For backward compatibility
export const selectMessageById = (state, messageId) => state.messages.messages[messageId];

// Conversation selectors
export const selectAllConversations = (state) => Object.values(state.messages.conversations);
export const selectConversationById = (state, conversationId) => state.messages.conversations[conversationId];
export const selectSelectedConversation = (state) => state.messages.selectedConversation;

// Get messages for a specific conversation
export const selectConversationMessages = createSelector(
  [(state) => state.messages.messages, (state, conversationId) => conversationId],
  (messages, conversationId) => {
    const conversation = conversationId && messages.conversations[conversationId];
    if (!conversation) return [];
    
    return conversation.messageIds
      .map(id => messages[id])
      .filter(Boolean)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }
);

// Thread selectors
export const selectMessageThread = (state, threadId) => 
  state.messages.threadMessages[threadId] 
    ? Object.values(state.messages.threadMessages[threadId]) 
    : [];

// Status selectors
export const selectMessagesLoading = (state) => state.messages.loading;
export const selectMessagesRefreshing = (state) => state.messages.refreshing;
export const selectMessagesError = (state) => state.messages.error;
export const selectSelectedMessageId = (state) => state.messages.selectedMessageId;
export const selectHasMoreMessages = (state) => state.messages.hasMoreMessages;
export const selectPagination = (state) => state.messages.pagination;
export const selectUnreadCount = (state) => state.messages.unreadCount;

// Get unread messages count for a specific conversation
export const selectConversationUnreadCount = (state, conversationId) => {
  const conversation = conversationId && state.messages.conversations[conversationId];
  return conversation ? conversation.unreadCount : 0;
};

export default messageSlice.reducer;
