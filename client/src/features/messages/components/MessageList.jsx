import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  fetchMessages, 
  deleteMessage, 
  markMessageAsRead, 
  setSelectedMessage,
  clearSelectedMessage,
  selectAllMessages,
  selectMessagesLoading,
  selectMessagesRefreshing,
  selectMessagesError,
  selectSelectedMessageId
} from '../messagesSlice';
import { selectUser } from '../../../store/authSlice';
import MessageItem from './MessageItem';
import MessageCompose from './MessageCompose';
import MessageThread from './MessageThread';
import './MessageStyles.css';

import { useSelector, useDispatch } from 'react-redux';

const MessageList = ({ isOpen, onClose, mapCenter }) => {
  // Get messages from Redux store
  const messages = useSelector(selectAllMessages);
  const loading = useSelector(selectMessagesLoading);
  const refreshing = useSelector(selectMessagesRefreshing);
  const error = useSelector(selectMessagesError);
  const selectedMessageId = useSelector(selectSelectedMessageId);
  const currentUser = useSelector(selectUser);
  // Note: pagination is handled in the Redux slice now
  const dispatch = useDispatch();
  // Local state for UI management
  const [isComposing, setIsComposing] = useState(false);
  const [showingThread, setShowingThread] = useState(false);
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

  // Handle message deletion
  const handleDeleteMessage = (e, messageId) => {
    e.stopPropagation(); // Prevent triggering the message click event
    if (window.confirm('Are you sure you want to delete this message?')) {
      dispatch(deleteMessage(messageId));
      // If the deleted message was selected, clear the selection
      if (selectedMessageId === messageId) {
        dispatch(clearSelectedMessage());
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
          <button 
            className="btn btn-primary mt-sm"
            onClick={handleComposeClick}
          >
            Compose Message
          </button>
        </div>
      );
    }
    
    return (
      <div>
        {messages.map(message => (
          <div 
            key={message._id} 
            onClick={() => handleMessageClick(message)}
            className="message-item-wrapper"
          >
            <MessageItem 
              message={message} 
              onReply={handleReplyClick} 
              onDelete={handleDeleteMessage}
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
        {/* Use MessageCompose directly instead of renderComposeForm */}
        {isComposing && (
          <MessageCompose 
            onCancel={handleComposeCancel} 
            mapCenter={mapCenter}
          />
        )}
        {/* Show message compose form if composing */}
        {isComposing && renderComposeForm()}
        
        {/* Show message thread if viewing a thread */}
        {!isComposing && showingThread && selectedMessageId && (
          <MessageThread 
            threadId={selectedMessageId} 
            onClose={handleThreadClose} 
          />
        )}
        
        {/* Show message list if not composing or viewing thread */}
        {!isComposing && !showingThread && (
          <div className="messages-container">
            {renderMessages()}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageList;
