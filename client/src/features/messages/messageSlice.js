import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  loading: false,
  error: null,
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
    setMessages: (state, action) => {
      state.messages = action.payload.messages || [];
      state.pagination = action.payload.pagination || initialState.pagination;
    },
    addMessage: (state, action) => {
      state.messages.unshift(action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
      state.pagination = initialState.pagination;
    }
  }
});

export const {
  setMessages,
  addMessage,
  setLoading,
  setError,
  clearMessages
} = messageSlice.actions;

export default messageSlice.reducer;
