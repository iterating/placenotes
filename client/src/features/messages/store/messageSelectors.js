import { createSelector } from '@reduxjs/toolkit';

// Base selectors
export const selectMessagesState = (state) => state.messages;
export const selectMessagesMap = (state) => state.messages.messages;
export const selectConversationsMap = (state) => state.messages.conversations;
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

// Conversation selectors
export const selectSelectedConversation = (state) => state.messages.selectedConversation;

export const selectAllConversations = createSelector(
  [selectConversationsMap],
  (conversations) => Object.values(conversations)
);

export const selectConversationById = (state, conversationId) => state.messages.conversations[conversationId];

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

export const selectConversationUnreadCount = createSelector(
  [selectConversationsMap, (_, conversationId) => conversationId],
  (conversations, conversationId) => {
    const conversation = conversationId && conversations[conversationId];
    return conversation ? conversation.unreadCount : 0;
  }
);
