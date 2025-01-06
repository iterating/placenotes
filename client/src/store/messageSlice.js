import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  loading: false,
  error: null,
  unreadCount: 0,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalMessages: 0
  }
};

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setMessages(state, action) {
      // Handle both array and paginated response formats
      const messages = Array.isArray(action.payload) 
        ? action.payload 
        : action.payload.messages || [];
      
      state.messages = messages;
      state.unreadCount = messages.filter(msg => !msg.read).length;
      
      // Update pagination if available
      if (action.payload.pagination) {
        state.pagination = action.payload.pagination;
      }
    },
    addMessage(state, action) {
      state.messages.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    markAsRead(state, action) {
      const message = state.messages.find(msg => msg._id === action.payload);
      if (message && !message.read) {
        message.read = true;
        state.unreadCount -= 1;
      }
    },
    clearMessages(state) {
      state.messages = [];
      state.unreadCount = 0;
      state.pagination = initialState.pagination;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    }
  }
});

export const { 
  setMessages, 
  addMessage, 
  markAsRead, 
  clearMessages,
  setLoading,
  setError
} = messageSlice.actions;

export const selectMessages = (state) => state.messages.messages;
export const selectUnreadCount = (state) => state.messages.unreadCount;
export const selectPagination = (state) => state.messages.pagination;
export const selectLoading = (state) => state.messages.loading;
export const selectError = (state) => state.messages.error;

export default messageSlice.reducer;
