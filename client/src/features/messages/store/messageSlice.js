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

export const hideMessage = createAsyncThunk(
  'messages/hideMessage',
  async (messageId, { rejectWithValue }) => {
    try {
      // We're not actually deleting the message on the server,
      // just marking it as hidden in the local state
      await messageService.hideMessage(messageId);
      return messageId;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to hide message');
    }
  }
);

export const markMessageAsRead = createAsyncThunk(
  'messages/markAsRead',
  async (messageId, { rejectWithValue }) => {
    try {
      const response = await messageService.markMessageAsRead(messageId);
      // Return the response which may include mockData flag
      return { messageId, ...response };
    } catch (error) {
      console.warn('Failed to mark message as read in thunk:', error.message);
      // Still update the UI even if the server call fails
      return { messageId, success: true, clientFallback: true };
    }
  }
);

export const fetchMessageThread = createAsyncThunk(
  'messages/fetchThread',
  async (messageId, { rejectWithValue }) => {
    try {
      const threadData = await messageService.fetchMessageThread(messageId);
      return { 
        threadId: messageId, 
        rootMessage: threadData.rootMessage,
        replies: threadData.replies || [],
        allMessages: threadData.allMessages || []
      };
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
        .filter(msg => !msg.read && !msg.hidden).length;
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
          .filter(msg => !msg.read && !msg.hidden).length;
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
      
      // Hide message instead of deleting
      .addCase(hideMessage.pending, (state) => {
        state.refreshing = true;
        state.error = null;
      })
      .addCase(hideMessage.fulfilled, (state, action) => {
        const messageId = action.payload;
        if (state.messages[messageId]) {
          // Mark the message as hidden instead of removing it
          state.messages[messageId] = {
            ...state.messages[messageId],
            hidden: true,
            read: true // Auto-mark as read when hidden
          };
          
          // Update unread count if necessary
          if (!state.messages[messageId].read) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          
          // If hidden message was selected, clear selection
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
      
      // Mark message as read
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
      });
  },
});

// Export actions
export const { 
  setMessages,
  addMessage,
  markAsRead,
  hideMessageById,
  setSelectedMessage, 
  clearSelectedMessage,
  clearMessageError,
  resetMessages,
  updateUnreadCount
} = messageSlice.actions;

// Base selectors (these don't need memoization since they return simple values)
export const selectMessagesState = (state) => state.messages;
export const selectMessagesMap = (state) => state.messages.messages;
export const selectConversationsMap = (state) => state.messages.conversations;
export const selectThreadMessagesMap = (state) => state.messages.threadMessages;

// Memoized selectors that return new objects/arrays
export const selectAllMessages = createSelector(
  [selectMessagesMap],
  (messages) => Object.values(messages)
);

// Filter out hidden messages
export const selectVisibleMessages = createSelector(
  [selectMessagesMap],
  (messages) => Object.values(messages).filter(message => !message.hidden)
);

export const selectMessages = selectVisibleMessages; // Updated for backward compatibility

export const selectMessageById = (state, messageId) => state.messages.messages[messageId];

// Conversation selectors
export const selectSelectedConversation = (state) => state.messages.selectedConversation;

export const selectAllConversations = createSelector(
  [selectConversationsMap],
  (conversations) => Object.values(conversations)
);

export const selectConversationById = (state, conversationId) => state.messages.conversations[conversationId];

// Get messages for a specific conversation
export const selectConversationMessages = createSelector(
  [
    (state) => state.messages.messages,
    (state) => state.messages.conversations,
    (state, conversationId) => conversationId
  ],
  (messages, conversations, conversationId) => {
    const conversation = conversationId && conversations[conversationId];
    if (!conversation) return [];
    
    return conversation.messageIds
      .map(id => messages[id])
      .filter(Boolean)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }
);

// Thread selectors
export const selectMessageThread = createSelector(
  [selectThreadMessagesMap, (_, threadId) => threadId],
  (threadMessages, threadId) => {
    const thread = threadMessages[threadId];
    return thread ? Object.values(thread) : [];
  }
);

// Status selectors
export const selectMessagesLoading = (state) => state.messages.loading;
export const selectMessagesRefreshing = (state) => state.messages.refreshing;
export const selectMessagesError = (state) => state.messages.error;
export const selectSelectedMessageId = (state) => state.messages.selectedMessageId;
export const selectHasMoreMessages = (state) => state.messages.hasMoreMessages;
export const selectPagination = (state) => state.messages.pagination;
export const selectUnreadCount = (state) => state.messages.unreadCount;

// Get unread messages count for a specific conversation
export const selectConversationUnreadCount = createSelector(
  [selectConversationsMap, (_, conversationId) => conversationId],
  (conversations, conversationId) => {
    const conversation = conversationId && conversations[conversationId];
    return conversation ? conversation.unreadCount : 0;
  }
);

export default messageSlice.reducer;
