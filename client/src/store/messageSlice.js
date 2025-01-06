import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  loading: false,
  error: null,
  unreadCount: 0
};

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setMessages(state, action) {
      state.messages = action.payload;
      state.unreadCount = action.payload.filter(msg => !msg.read).length;
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
    }
  }
});

export const { 
  setMessages, 
  addMessage, 
  markAsRead, 
  clearMessages 
} = messageSlice.actions;

export const selectMessages = (state) => state.messages.messages;
export const selectUnreadCount = (state) => state.messages.unreadCount;

export default messageSlice.reducer;
