import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchMessages,
  hideMessage,
  markMessageAsRead,
  setSelectedMessage,
  clearSelectedMessage,
  selectVisibleMessages,
  selectMessagesLoading,
  selectMessagesRefreshing,
  selectMessagesError,
  selectSelectedMessageId,
  selectPagination,
  selectHiddenMessages,
} from '../store/messageSlice';
import { selectUser } from '../../../store/authSlice';

/**
 * Custom hook to manage the state and logic for the MessageList component.
 * @param {boolean} isOpen - Whether the message list container is open.
 * @param {object} mapCenter - The current center of the map { type: 'Point', coordinates: [lon, lat] }.
 */
export const useMessageList = (isOpen, mapCenter) => {
  const dispatch = useDispatch();

  // Selectors
  const messages = useSelector(selectVisibleMessages);
  const hiddenMessages = useSelector(selectHiddenMessages);
  const loading = useSelector(selectMessagesLoading);
  const refreshing = useSelector(selectMessagesRefreshing);
  const error = useSelector(selectMessagesError);
  const selectedMessageId = useSelector(selectSelectedMessageId);
  const currentUser = useSelector(selectUser);
  const pagination = useSelector(selectPagination);

  // Local UI State
  const [isComposing, setIsComposing] = useState(false);
  const [showingThread, setShowingThread] = useState(false);
  const [showingHiddenMessages, setShowingHiddenMessages] = useState(false);
  const refreshTimerRef = useRef(null); // Use ref to hold timer ID

  // --- Logic --- 

  // Function to fetch messages (using useCallback for stability)
  const fetchUserMessages = useCallback((page = 1, limit = 20) => {
    const options = { page, limit };
    if (mapCenter && mapCenter.coordinates) {
      options.location = {
        type: 'Point',
        coordinates: mapCenter.coordinates,
      };
      options.radius = 5000; // 5km radius
      console.log('useMessageList: Fetching by location:', options);
    } else {
        console.log('useMessageList: Fetching without location:', options);
    }
    dispatch(fetchMessages(options));
  }, [dispatch, mapCenter]);

  // Initial fetch when component opens or map center changes
  useEffect(() => {
    if (isOpen) {
      console.log('useMessageList: isOpen changed, fetching initial messages.');
      fetchUserMessages(1); // Fetch first page
    }
  }, [isOpen, fetchUserMessages]);

  // Auto-refresh interval
  useEffect(() => {
    if (isOpen) {
      console.log('useMessageList: Setting up auto-refresh timer.');
      // Clear any existing timer before setting a new one
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
      refreshTimerRef.current = setInterval(() => {
        console.log('useMessageList: Auto-refreshing messages');
        // Fetch without changing page, maintain current view
        fetchUserMessages(pagination?.currentPage || 1);
      }, 20000); // Refresh every 20 seconds
    } else {
      // Clear timer if drawer is closed
      if (refreshTimerRef.current) {
        console.log('useMessageList: Clearing auto-refresh timer.');
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    }

    // Cleanup timer on unmount or when dependencies change
    return () => {
      if (refreshTimerRef.current) {
        console.log('useMessageList: Cleaning up auto-refresh timer in effect return.');
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [isOpen, fetchUserMessages, pagination?.currentPage]);

  // --- Handlers --- 

  const handleSelectMessage = useCallback((message) => {
    if (!message) return;
    // Mark as read if needed
    if (!message.read && message.senderId !== currentUser?._id) {
      dispatch(markMessageAsRead(message._id));
    }
    dispatch(setSelectedMessage(message._id));
    setShowingThread(true);
    setIsComposing(false); // Close compose if open
    setShowingHiddenMessages(false); // Close hidden if open
  }, [dispatch, currentUser]);

  const handleHideMessage = useCallback((messageId) => {
    // Confirmation could be handled in the component or here
    dispatch(hideMessage(messageId));
    // If the hidden message was selected, clear the selection
    if (selectedMessageId === messageId) {
      dispatch(clearSelectedMessage());
      setShowingThread(false);
    }
  }, [dispatch, selectedMessageId]);

  const handleOpenCompose = useCallback(() => {
    setIsComposing(true);
    setShowingThread(false);
    setShowingHiddenMessages(false);
    dispatch(clearSelectedMessage()); // Clear selection when starting new compose
  }, [dispatch]);

  const handleCloseCompose = useCallback(() => {
    setIsComposing(false);
  }, []);

  const handleCloseThread = useCallback(() => {
    setShowingThread(false);
    dispatch(clearSelectedMessage());
  }, [dispatch]);

  const handleLoadMore = useCallback(() => {
    if (pagination && pagination.currentPage < pagination.totalPages) {
      const nextPage = pagination.currentPage + 1;
      console.log(`useMessageList: Loading more messages, page ${nextPage}`);
      fetchUserMessages(nextPage);
    }
  }, [fetchUserMessages, pagination]);

  const handleViewHidden = useCallback(() => {
    setShowingHiddenMessages(true);
    setIsComposing(false);
    setShowingThread(false);
  }, []);

  const handleCloseHidden = useCallback(() => {
    setShowingHiddenMessages(false);
  }, []);

  // --- Return Values --- 
  return {
    // State
    messages,
    hiddenMessages,
    loading,
    refreshing,
    error,
    selectedMessageId,
    currentUser,
    pagination,
    isComposing,
    showingThread,
    showingHiddenMessages,

    // Actions / Handlers
    selectMessage: handleSelectMessage,
    hideMessage: handleHideMessage, // Consider renaming if it needs confirmation dialog
    openCompose: handleOpenCompose,
    closeCompose: handleCloseCompose,
    closeThread: handleCloseThread,
    loadMoreMessages: handleLoadMore,
    viewHiddenMessages: handleViewHidden,
    closeHiddenMessages: handleCloseHidden,
    retryFetch: () => fetchUserMessages(1) // Simple retry fetches page 1
  };
};
