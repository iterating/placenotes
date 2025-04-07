import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as messageService from './services/messageService';

// Initial state
const initialState = {
  messages: {},
  threadMessages: {},
  loading: false,
  refreshing: false,
  error: null,
  currentPage: 1,
  hasMoreMessages: true,
  selectedMessageId: null,
};

// Async thunks
export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await messageService.fetchMessages(page, limit);
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
const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
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
      state.currentPage = 1;
      state.hasMoreMessages = true;
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
        const { [messageId]: deletedMessage, ...remainingMessages } = state.messages;
        state.messages = remainingMessages;
        state.refreshing = false;
        
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
        state.messages[updatedMessage._id] = {
          ...state.messages[updatedMessage._id],
          ...updatedMessage
        };
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
  setSelectedMessage, 
  clearSelectedMessage,
  clearMessageError,
  resetMessages
} = messagesSlice.actions;

// Selectors
export const selectAllMessages = (state) => Object.values(state.messages.messages);
export const selectMessageById = (state, messageId) => state.messages.messages[messageId];
export const selectMessageThread = (state, threadId) => 
  state.messages.threadMessages[threadId] 
    ? Object.values(state.messages.threadMessages[threadId]) 
    : [];
export const selectMessagesLoading = (state) => state.messages.loading;
export const selectMessagesRefreshing = (state) => state.messages.refreshing;
export const selectMessagesError = (state) => state.messages.error;
export const selectSelectedMessageId = (state) => state.messages.selectedMessageId;
export const selectHasMoreMessages = (state) => state.messages.hasMoreMessages;

export default messagesSlice.reducer;
