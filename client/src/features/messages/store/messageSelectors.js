import { createSelector } from '@reduxjs/toolkit';

// Base selectors
export const selectMessagesState = (state) => state.messages;
export const selectMessagesMap = (state) => state.messages.messages;
export const selectThreadMessagesMap = (state) => state.messages.threadMessages;

// Memoized selectors for messages
export const selectAllMessages = createSelector(
  [selectMessagesMap],
  (messages) => Object.values(messages)
);

export const selectVisibleMessages = createSelector(
  [selectMessagesMap],
  (messages) => Object.values(messages).filter(message => !message.hidden)
);

export const selectHiddenMessages = createSelector(
  [selectMessagesMap],
  (messages) => Object.values(messages).filter(message => message.hidden)
);

// For backward compatibility
export const selectMessages = selectVisibleMessages;

export const selectMessageById = (state, messageId) => state.messages.messages[messageId];

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
export const selectPagination = (state) => state.messages.pagination;
export const selectUnreadCount = (state) => state.messages.unreadCount;

// Correctly derive hasMoreMessages from pagination
export const selectHasMoreMessages = createSelector(
  [selectPagination],
  (pagination) => pagination.currentPage < pagination.totalPages
);
