/**
 * Constants for message slice
 */

// Thunk action types
export const FETCH_MESSAGES = 'messages/fetchMessages';
export const SEND_MESSAGE = 'messages/sendMessage';
export const HIDE_MESSAGE = 'messages/hideMessage';
export const UNHIDE_MESSAGE = 'messages/unhideMessage';
export const MARK_MESSAGE_AS_READ = 'messages/markAsRead';
export const FETCH_MESSAGE_THREAD = 'messages/fetchThread';
export const REPLY_TO_MESSAGE = 'messages/replyToMessage';

// Error messages
export const FETCH_MESSAGES_ERROR = 'Failed to fetch messages';
export const SEND_MESSAGE_ERROR = 'Failed to send message';
export const HIDE_MESSAGE_ERROR = 'Failed to hide message';
export const UNHIDE_MESSAGE_ERROR = 'Failed to unhide message';
export const MARK_AS_READ_ERROR = 'Failed to mark message as read';
export const FETCH_THREAD_ERROR = 'Failed to fetch message thread';
export const REPLY_TO_MESSAGE_ERROR = 'Failed to send reply';
