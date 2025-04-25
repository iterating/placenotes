import { createSlice, createSelector } from '@reduxjs/toolkit';
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
  threadMessages: {},       // Messages in a thread keyed by parent message ID
  loading: false,           // Global loading state
  refreshing: false,        // Refresh indicator (doesn't block UI)
  error: null,              // Global error state
  selectedMessageId: null,  // Currently selected message
  unreadCount: 0,           // Total unread messages count
  pagination: {             // Pagination metadata
    currentPage: 1,
    totalPages: 1,
    totalMessages: 0
  }
};

// Create the slice
const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setMessages: (state, action) => {
      const messages = Array.isArray(action.payload) 
        ? action.payload 
        : action.payload.messages || [];
      
      state.messages = messageService.normalizeMessages(messages); // Replace existing messages

      // Update pagination if provided
      if (action.payload.pagination) {
        state.pagination = action.payload.pagination;
      }

      // Recalculate unread count based on the newly set messages
      state.unreadCount = Object.values(state.messages).reduce((count, msg) => count + (msg.read ? 0 : 1), 0);
    },
    addMessage: (state, action) => {
      const newMessage = action.payload;
      
      state.messages[newMessage._id] = newMessage;
      
      if (!newMessage.read) {
        state.unreadCount += 1;
      }
      
      if (newMessage.parentMessageId && newMessage.parentMessageId !== newMessage._id) {
        if (!state.threadMessages[newMessage.parentMessageId]) {
          state.threadMessages[newMessage.parentMessageId] = {};
        }
        state.threadMessages[newMessage.parentMessageId][newMessage._id] = newMessage;
      }
    },
    setSelectedMessage: (state, action) => {
      state.selectedMessageId = action.payload;
    },
    clearSelectedMessage: (state) => {
      state.selectedMessageId = null;
    },
    clearMessageError: (state) => {
      state.error = null;
    },
    resetMessages: (state) => {
      state.messages = {};
      state.threadMessages = {};
      state.unreadCount = 0;
      state.selectedMessageId = null;
      state.pagination = { currentPage: 1, totalPages: 1, totalMessages: 0 };
    },
  },
  extraReducers: (builder) => {
    builder
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
        
        state.messages = messageService.normalizeMessages(messages);
        
        state.loading = false;
        state.refreshing = false;
        state.error = null;
        
        if (payload.pagination) {
          state.pagination = payload.pagination;
        }
        
        state.unreadCount = Object.values(state.messages)
          .filter(msg => !msg.read && !msg.hidden).length;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload || 'Failed to fetch messages';
      })
      
      .addCase(sendMessage.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        
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
            read: true, 
            pending: true, 
            tempId: `temp_${Date.now()}` 
          };
          
          state.messages[tempMessage._id] = tempMessage;
          
          if (tempMessage.parentMessageId && state.threadMessages[tempMessage.parentMessageId]) {
            state.threadMessages[tempMessage.parentMessageId][tempMessage._id] = tempMessage;
          }
          
          action.meta.tempId = tempMessage._id;
        }
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        
        const message = action.payload;
        
        if (action.meta.tempId && state.messages[action.meta.tempId]) {
          delete state.messages[action.meta.tempId];
          
          if (message.parentMessageId && 
              state.threadMessages[message.parentMessageId] && 
              state.threadMessages[message.parentMessageId][action.meta.tempId]) {
            delete state.threadMessages[message.parentMessageId][action.meta.tempId];
          }
        }
        
        state.messages[message._id] = {
          ...message,
          pending: false,
          sendFailed: false
        };
        
        if (message.parentMessageId && state.threadMessages[message.parentMessageId]) {
          state.threadMessages[message.parentMessageId][message._id] = {
            ...message,
            pending: false,
            sendFailed: false
          };
        }
        
        if (!message.read) {
          state.unreadCount += 1;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to send message';
        
        if (action.meta.tempId && state.messages[action.meta.tempId]) {
          state.messages[action.meta.tempId] = {
            ...state.messages[action.meta.tempId],
            pending: false,
            sendFailed: true,
            errorMessage: action.payload || 'Failed to send message'
          };
          
          if (state.messages[action.meta.tempId].parentMessageId && 
              state.threadMessages[state.messages[action.meta.tempId].parentMessageId] && 
              state.threadMessages[state.messages[action.meta.tempId].parentMessageId][action.meta.tempId]) {
            
            state.threadMessages[state.messages[action.meta.tempId].parentMessageId][action.meta.tempId] = {
              ...state.threadMessages[state.messages[action.meta.tempId].parentMessageId][action.meta.tempId],
              pending: false,
              sendFailed: true,
              errorMessage: action.payload || 'Failed to send message'
            };
          }
        }
      })
      
      .addCase(markMessageAsRead.pending, (state) => {
        state.refreshing = true;
      })
      .addCase(markMessageAsRead.fulfilled, (state, action) => {
        const { messageId, success } = action.payload;
        state.refreshing = false;
        
        if (!success) return;
        
        if (state.messages[messageId]) {
          state.messages[messageId].read = true;
        }
        
        state.unreadCount = Math.max(0, state.unreadCount - 1);
        
        Object.keys(state.threadMessages).forEach(threadId => {
          if (state.threadMessages[threadId][messageId]) {
            state.threadMessages[threadId][messageId].read = true;
          }
        });
      })
      .addCase(markMessageAsRead.rejected, (state, action) => {
        state.refreshing = false;
        console.error('markMessageAsRead rejected:', action.payload || 'Unknown error');
      })
      
      .addCase(hideMessage.pending, (state) => {
        state.refreshing = true;
        state.error = null;
      })
      .addCase(hideMessage.fulfilled, (state, action) => {
        const messageId = action.payload;
        if (messageId && state.messages[messageId]) {
          state.messages[messageId].hidden = true;
          
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
      
      .addCase(unhideMessage.pending, (state) => {
        state.refreshing = true;
        state.error = null;
      })
      .addCase(unhideMessage.fulfilled, (state, action) => {
        const messageId = action.payload;
        if (messageId && state.messages[messageId]) {
          state.messages[messageId].hidden = false;
        }
        state.refreshing = false;
      })
      .addCase(unhideMessage.rejected, (state, action) => {
        state.refreshing = false;
        state.error = action.payload || 'Failed to unhide message';
      })
      
      .addCase(fetchMessageThread.pending, (state) => {
        state.refreshing = true;
        state.error = null;
      })
      .addCase(fetchMessageThread.fulfilled, (state, action) => {
        const { threadId, rootMessage, replies } = action.payload;

        // Normalize and merge root message and replies into state.messages
        const allThreadMessages = [rootMessage, ...replies].filter(Boolean); // Filter out null/undefined
        const normalizedThreadMessages = messageService.normalizeMessages(allThreadMessages);
        state.messages = { ...state.messages, ...normalizedThreadMessages };

        // Update threadMessages state specifically for the thread view
        if (threadId) {
          const normalizedReplies = messageService.normalizeMessages(replies);
          state.threadMessages[threadId] = normalizedReplies;
        }

        // Recalculate unread count as new messages might have been added
        state.unreadCount = Object.values(state.messages).reduce((count, msg) => count + (msg.read ? 0 : 1), 0);

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
  setSelectedMessage, 
  clearSelectedMessage,
  clearMessageError,
  resetMessages
} = messageSlice.actions;

// Export the slice reducer as default
export default messageSlice.reducer;
