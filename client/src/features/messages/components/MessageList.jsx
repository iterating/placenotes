import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  selectHiddenMessages
} from '../store/messageSlice';
import { selectUser } from '../../../store/authSlice';
import MessageItem from './MessageItem';
import MessageCompose from './MessageCompose';
import MessageThread from './MessageThread';
import HiddenMessages from './HiddenMessages';
import './MessageStyles.css';

import { useSelector, useDispatch } from 'react-redux';

const MessageList = ({ isOpen, onClose, mapCenter }) => {
  // Get messages from Redux store using memoized selectors (only visible messages)
  const messages = useSelector(selectVisibleMessages);
  const hiddenMessages = useSelector(selectHiddenMessages);
  const loading = useSelector(selectMessagesLoading);
  const refreshing = useSelector(selectMessagesRefreshing);
  const error = useSelector(selectMessagesError);
  const selectedMessageId = useSelector(selectSelectedMessageId);
  const currentUser = useSelector(selectUser);
  const pagination = useSelector(selectPagination);
  const dispatch = useDispatch();
  // Local state for UI management
  const [isComposing, setIsComposing] = useState(false);
  const [showingThread, setShowingThread] = useState(false);
  const [showingHiddenMessages, setShowingHiddenMessages] = useState(false);
  const [refreshTimerId, setRefreshTimerId] = useState(null);

  // Function to fetch messages based on current location
  const fetchUserMessages = useCallback(() => {
    if (mapCenter && mapCenter.coordinates) {
      // If map center is available, fetch messages by location
      console.log('MessageList: Fetching by location with coordinates:', mapCenter.coordinates);
      dispatch(fetchMessages({
        page: 1,
        limit: 20,
        location: {
          type: 'Point',
          coordinates: mapCenter.coordinates
        },
        radius: 5000 // 5km radius
      }));
    } else {
      dispatch(fetchMessages({ page: 1, limit: 20 }));
    }
  }, [dispatch, mapCenter]);

  // Fetch messages when component mounts or when map center changes
  useEffect(() => {
    if (isOpen) {
      fetchUserMessages();
    }
  }, [isOpen, fetchUserMessages]);

  // Set up automatic refresh interval (every 20 seconds)
  useEffect(() => {
    // Only set up the interval if the drawer is open
    if (!isOpen) return;
    
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing messages');
      fetchUserMessages();
    }, 20000); // refresh every 20 seconds
    
    setRefreshTimerId(refreshInterval);
    
    return () => {
      if (refreshTimerId) clearInterval(refreshTimerId);
    };
  }, [isOpen, dispatch, mapCenter, fetchUserMessages]);

  // Debug log current messages state
  useEffect(() => {
    console.log('MessageList: Current messages in store:', messages);
    if (messages && messages.length > 0) {
      console.log('First message details:', {
        id: messages[0]._id,
        sender: messages[0].senderName || 'Unknown',
        content: messages[0].content,
        read: messages[0].read,
        date: new Date(messages[0].createdAt).toLocaleString(),
      });
    } else {
      console.log('No messages found in store');
    }
    console.log('MessageList: Loading state:', loading);
    console.log('MessageList: Error state:', refreshing);
  }, [messages, loading, refreshing]);

  // Handle message click - mark as read and show details
  const handleMessageClick = useCallback((message) => {
    // Mark as read if not already
    if (!message.read && message.senderId !== currentUser?._id) {
      dispatch(markMessageAsRead(message._id));
    }
    dispatch(setSelectedMessage(message._id));
    setShowingThread(true);
  }, [dispatch, currentUser]);

  // Handle message hiding (replacing deletion)
  const handleHideMessage = (e, messageId) => {
    e.stopPropagation(); // Prevent triggering the message click event
    
    if (window.confirm('Are you sure you want to hide this message? It will no longer appear in your message list.')) {
      dispatch(hideMessage(messageId));
      
      // If the hidden message was selected, clear the selection
      if (selectedMessageId === messageId) {
        dispatch(clearSelectedMessage());
        setShowingThread(false);
      }
    }
  };

  // Format date to a readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  // Handle compose button click
  const handleComposeClick = () => {
    setIsComposing(true);
    setShowingThread(false);
    dispatch(clearSelectedMessage());
  };

  // Cancel composing a new message
  const handleComposeCancel = () => {
    setIsComposing(false);
  };

  // Handle back button in thread view
  const handleThreadClose = () => {
    setShowingThread(false);
    dispatch(clearSelectedMessage());
  };

  // Handle loading more messages
  const handleLoadMore = () => {
    const nextPage = Math.ceil(messages.length / 20) + 1;
    fetchUserMessages(nextPage);
  };

  // Handle reply click
  const handleReplyClick = (message) => {
    setIsComposing(true);
    dispatch(setSelectedMessage(message._id));
  };

  // Render the message list
  const renderMessages = () => {
    if (loading && !refreshing) {
      return <div className="loading-indicator">Loading messages...</div>;
    }
    
    if (messages.length === 0) {
      return (
        <div className="empty-state">
          <p>No messages found in this area.</p>
          <div className="flex-col gap-sm">
            <button 
              className="btn btn-primary"
              onClick={handleComposeClick}
            >
              Compose Message
            </button>
            
            {hiddenMessages.length > 0 && (
              <button
                className="btn btn-outline-secondary"
                onClick={handleViewHiddenMessages}
              >
                View Hidden Messages ({hiddenMessages.length})
              </button>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div>
        <div className="messages-actions">
          <button 
            className="btn btn-primary"
            onClick={handleComposeClick}
          >
            Compose Message
          </button>
          
          {hiddenMessages.length > 0 && (
            <button
              className="btn btn-outline-secondary"
              onClick={handleViewHiddenMessages}
            >
              View Hidden Messages ({hiddenMessages.length})
            </button>
          )}
        </div>
        
        {messages.map(message => (
          <div 
            key={message._id} 
            onClick={() => handleMessageClick(message)}
            className="message-item-wrapper"
          >
            <MessageItem 
              key={message._id} 
              message={message} 
              onReply={handleReplyClick} 
              onDelete={(e) => handleHideMessage(e, message._id)}
            />
          </div>
        ))}
        {!refreshing && messages.length > 10 && (
          <div className="load-more">
            <button 
              className="btn btn-outline-primary"
              onClick={handleLoadMore}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    );
  };

  // Handle viewing hidden messages
  const handleViewHiddenMessages = () => {
    setShowingHiddenMessages(true);
    setIsComposing(false);
    setShowingThread(false);
  };

  // Handle closing hidden messages view
  const handleCloseHiddenMessages = () => {
    setShowingHiddenMessages(false);
  };

  // Render message list header
  const renderHeader = () => {
    return (
      <div className="messages-header">
        <h2 className="messages-title">
          {showingThread ? 'Message Thread' : 
           isComposing ? 'New Message' : 'Messages'}
        </h2>
        <button 
          className="close-button"
          onClick={onClose}
          aria-label="Close messages"
        >
          <span className="icon">×</span>
        </button>
      </div>
    );
  };

  // Render the compose new message form using the MessageCompose component
  const renderComposeForm = () => {
    return (
      <MessageCompose
        onCancel={() => setIsComposing(false)}
        onSuccess={() => setIsComposing(false)}
        parentMessage={selectedMessageId ? messages.find(m => m._id === selectedMessageId) : null}
        mapCenter={mapCenter}
      />
    );
  };


  // Render empty state
  const renderEmptyState = () => (
    <div className="empty-state flex-col flex-center">
      <div className="empty-icon">📭</div>
      <h3>No Messages</h3>
      <p className="text-secondary">You don't have any messages yet.</p>
    </div>
  );

  // Render loading state
  const renderLoading = () => (
    <div className="loading-state flex-col flex-center">
      <div className="loading-spinner"></div>
      <p className="text-secondary">Loading messages...</p>
    </div>
  );

  // Render error state
  const renderError = () => (
    <div className="error-state flex-col flex-center">
      <div className="error-icon">⚠️</div>
      <h3>Error</h3>
      <p className="text-secondary">{error || 'Failed to load messages'}</p>
      <button 
        onClick={() => dispatch(fetchMessages())}
        className="btn btn-primary mt-sm"
      >
        Try Again
      </button>
    </div>
  );

  // Render pagination controls if needed
  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    
    return (
      <div className="flex-between items-center mt-md">
        <button 
          className="btn btn-secondary btn-sm"
          disabled={pagination.currentPage === 1}
          onClick={() => dispatch(fetchMessages(pagination.currentPage - 1))}
        >
          Previous
        </button>
        <span className="text-secondary">{pagination.currentPage} of {pagination.totalPages}</span>
        <button 
          className="btn btn-secondary btn-sm"
          disabled={pagination.currentPage === pagination.totalPages}
          onClick={() => dispatch(fetchMessages(pagination.currentPage + 1))}
        >
          Next
        </button>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className={`drawer-base drawer-right ${isOpen ? 'open' : ''}`}>
      {renderHeader()}
      
      <div className="drawer-content">
        {/* Render only one component based on state */}
        {isComposing ? (
          /* Show message compose form if composing */
          <div key="compose-form">
            <MessageCompose 
              onCancel={handleComposeCancel} 
              onSuccess={() => setIsComposing(false)}
              parentMessageId={selectedMessageId}
              mapCenter={mapCenter}
            />
          </div>
        ) : showingThread && selectedMessageId ? (
          /* Show message thread if viewing a thread */
          <div key="message-thread">
            <MessageThread 
              threadId={selectedMessageId} 
              onClose={handleThreadClose} 
            />
          </div>
        ) : showingHiddenMessages ? (
          /* Show hidden messages */
          <div key="hidden-messages">
            <div className="messages-header">
              <h2 className="messages-title">Hidden Messages</h2>
              <button 
                className="close-button"
                onClick={handleCloseHiddenMessages}
                aria-label="Close hidden messages"
              >
                <span className="icon">×</span>
              </button>
            </div>
            <HiddenMessages />
          </div>
        ) : (
          /* Show message list by default */
          <div key="messages-container" className="messages-container">
            {renderMessages()}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageList;
