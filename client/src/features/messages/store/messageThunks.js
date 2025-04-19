import { createAsyncThunk } from '@reduxjs/toolkit';
import * as messageService from '../services/messageService';
import {
  FETCH_MESSAGES,
  SEND_MESSAGE,
  HIDE_MESSAGE,
  UNHIDE_MESSAGE,
  MARK_MESSAGE_AS_READ,
  FETCH_MESSAGE_THREAD,
  REPLY_TO_MESSAGE,
  FETCH_MESSAGES_ERROR,
  SEND_MESSAGE_ERROR,
  HIDE_MESSAGE_ERROR,
  UNHIDE_MESSAGE_ERROR,
  MARK_AS_READ_ERROR,
  FETCH_THREAD_ERROR,
  REPLY_TO_MESSAGE_ERROR
} from './constants';

/**
 * Fetch messages with optional location filtering
 */
export const fetchMessages = createAsyncThunk(
  FETCH_MESSAGES,
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
      return rejectWithValue(error.message || FETCH_MESSAGES_ERROR);
    }
  }
);

/**
 * Send a new message
 */
export const sendMessage = createAsyncThunk(
  SEND_MESSAGE,
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await messageService.sendMessage(messageData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || SEND_MESSAGE_ERROR);
    }
  }
);

/**
 * Hide a message (updates on server and client)
 */
export const hideMessage = createAsyncThunk(
  HIDE_MESSAGE,
  async (messageId, { rejectWithValue }) => {
    try {
      // Send request to server to update the hidden status
      await messageService.hideMessage(messageId);
      return messageId;
    } catch (error) {
      return rejectWithValue(error.message || HIDE_MESSAGE_ERROR);
    }
  }
);

/**
 * Unhide a message (updates on server and client)
 */
export const unhideMessage = createAsyncThunk(
  UNHIDE_MESSAGE,
  async (messageId, { rejectWithValue }) => {
    try {
      // Send request to server to update the hidden status
      await messageService.unhideMessage(messageId);
      return messageId;
    } catch (error) {
      return rejectWithValue(error.message || UNHIDE_MESSAGE_ERROR);
    }
  }
);

/**
 * Mark a message as read
 */
export const markMessageAsRead = createAsyncThunk(
  MARK_MESSAGE_AS_READ,
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

/**
 * Fetch a complete message thread (original + replies)
 */
export const fetchMessageThread = createAsyncThunk(
  FETCH_MESSAGE_THREAD,
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
      return rejectWithValue(error.message || FETCH_THREAD_ERROR);
    }
  }
);

/**
 * Reply to a message in a thread
 */
export const replyToMessage = createAsyncThunk(
  REPLY_TO_MESSAGE,
  async ({ parentMessageId, replyData }, { rejectWithValue }) => {
    try {
      const response = await messageService.replyToMessage(parentMessageId, replyData);
      return {
        parentMessageId,
        replyMessage: response,
        success: true
      };
    } catch (error) {
      return rejectWithValue(error.message || REPLY_TO_MESSAGE_ERROR);
    }
  }
);
