import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchMessageThread,
  sendMessage,
  hideMessage,
  markMessageAsRead,
  selectMessageById,
  selectMessageThread, // Renamed from selectRepliesByThreadId
  selectMessagesRefreshing, // Assuming this reflects thread loading state
  selectMessagesError,
} from '../store/messageSlice';
import { selectUser as selectAuthUser } from '../../../store/authSlice';
import { getCurrentLocationFromStorage, toGeoJSONPoint } from '../../../lib/GeoUtils';

/**
 * Custom hook to manage message thread logic.
 * @param {string} threadId - The ID of the root message for the thread.
 * @returns {object} - State and actions for the message thread.
 */
export const useMessageThread = (threadId) => {
  const dispatch = useDispatch();
  
  // Selectors
  const rootMessage = useSelector(state => threadId ? selectMessageById(state, threadId) : null);
  const replies = useSelector(state => threadId ? selectMessageThread(state, threadId) : []);
  const isLoading = useSelector(selectMessagesRefreshing); // Using refreshing as loading indicator for the thread
  const error = useSelector(selectMessagesError);
  const currentUser = useSelector(selectAuthUser);

  const [isReplying, setIsReplying] = useState(false);
  const [sendError, setSendError] = useState(null); // Separate error state for sending

  // Fetch thread data on mount or when threadId changes
  useEffect(() => {
    if (threadId) {
      // Mark as read when opening
      dispatch(markMessageAsRead(threadId)).catch(err => console.warn('Failed to mark message as read:', err));
      // Fetch the thread data
      dispatch(fetchMessageThread(threadId)).catch(err => console.error('Failed initial fetchMessageThread:', err));
    }
    // Reset reply state when thread changes
    setIsReplying(false);
    setSendError(null);
  }, [dispatch, threadId]);

  // Actions
  const openReplyBox = useCallback(() => setIsReplying(true), []);
  const closeReplyBox = useCallback(() => {
    setIsReplying(false);
    setSendError(null); // Clear send error when cancelling
  }, []);

  const sendReply = useCallback(async (replyContent) => {
    if (!replyContent || !rootMessage || !currentUser) {
      setSendError('Cannot send reply: missing data.');
      return;
    }
    
    setSendError(null);
    let currentLocation;
    try {
      currentLocation = getCurrentLocationFromStorage() || toGeoJSONPoint({ latitude: 34.052235, longitude: -118.243683 });
    } catch (e) {
      console.warn('Could not get current location:', e);
      currentLocation = toGeoJSONPoint({ latitude: 34.052235, longitude: -118.243683 });
    }

    const messageData = {
      content: replyContent,
      recipientId: rootMessage.senderId,
      parentMessageId: rootMessage._id,
      location: currentLocation,
      senderId: currentUser._id, 
      senderName: currentUser.username || currentUser.name || 'You'
    };

    try {
      await dispatch(sendMessage(messageData)).unwrap();
      setIsReplying(false); // Close reply box on success
    } catch (err) {
      console.error('Failed to send reply:', err);
      setSendError(err.message || 'Failed to send reply.');
      // Error state is managed by the slice for the message itself (sendFailed: true)
      // This sendError state is for the compose box UI
    }
  }, [dispatch, rootMessage, currentUser]);

  const hideSpecificMessage = useCallback(async (messageIdToHide) => {
    if (!messageIdToHide) return;
    try {
      await dispatch(hideMessage(messageIdToHide)).unwrap();
      // Optionally: If the root message was hidden, maybe trigger an action like closing the thread
      // if (messageIdToHide === threadId) { /* handle closing */ }
    } catch (err) {
      console.error('Failed to hide message:', err);
      // Maybe set an error state here if needed
    }
  }, [dispatch]);
  
  // Combine root and replies for rendering
  // Sort replies by timestamp before combining
  const sortedReplies = [...replies].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const messagesToDisplay = rootMessage ? [rootMessage, ...sortedReplies] : sortedReplies;

  return {
    rootMessage,
    replies, // Already sorted
    messagesToDisplay, // Combined and sorted
    isLoading, // Loading state for the thread fetch
    error, // Error state for the thread fetch
    isReplying,
    sendError, // Error specifically for the send operation
    currentUser, // Current user info
    openReplyBox,
    closeReplyBox,
    sendReply,
    hideSpecificMessage,
  };
};
