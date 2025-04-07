import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectMessages, 
  selectLoading, 
  selectError,
  selectPagination
} from '../../../store/messageSlice';
import { fetchMessages, markMessageAsRead, fetchMessagesByLocation, deleteMessage, sendMessage } from '../../../store/messageStoreAction';
// Import message-specific styles
import './MessageStyles.css';

const MessageList = ({ isOpen, onClose, mapCenter }) => {
  const dispatch = useDispatch();
  const messages = useSelector(selectMessages);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const pagination = useSelector(selectPagination);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const replyInputRef = useRef(null);

  // Fetch messages when component mounts or when map center changes
  useEffect(() => {
    if (isOpen) {
      console.log('MessageList: Fetching messages, mapCenter:', mapCenter);
      if (mapCenter && mapCenter.coordinates) {
        // If map center is available, fetch messages by location
        console.log('MessageList: Fetching by location with coordinates:', mapCenter.coordinates);
        dispatch(fetchMessagesByLocation({
          location: {
            type: 'Point',
            coordinates: mapCenter.coordinates
          },
          radius: 5000 // Default radius in meters
        }));
      } else {
        // Otherwise fetch all messages
        console.log('MessageList: Fetching all messages for inbox');
        dispatch(fetchMessages());
      }
    }
  }, [dispatch, isOpen, mapCenter]);
  
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
    console.log('MessageList: Error state:', error);
  }, [messages, loading, error]);

  // Handle message click - mark as read and show details
  const handleMessageClick = (message) => {
    if (!message.read) {
      dispatch(markMessageAsRead(message._id));
    }
    setSelectedMessage(message._id === selectedMessage?._id ? null : message);
    setIsReplying(false);
    setReplyText('');
  };
  
  // Handle message deletion
  const handleDeleteMessage = (e, messageId) => {
    e.stopPropagation(); // Prevent triggering the message click event
    if (window.confirm('Are you sure you want to delete this message?')) {
      dispatch(deleteMessage(messageId));
      // If the deleted message was selected, clear the selection
      if (selectedMessage && selectedMessage._id === messageId) {
        setSelectedMessage(null);
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
  
  // Start replying to a message
  const handleReplyClick = (e, message) => {
    e.stopPropagation(); // Prevent triggering the message click event
    setSelectedMessage(message);
    setIsReplying(true);
    setTimeout(() => {
      if (replyInputRef.current) {
        replyInputRef.current.focus();
      }
    }, 100);
  };
  
  // Submit a reply to a message
  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedMessage) return;
    
    dispatch(sendMessage({
      recipientId: selectedMessage.senderId,
      content: replyText.trim(),
      parentMessageId: selectedMessage._id,
      location: mapCenter || { type: 'Point', coordinates: selectedMessage.location.coordinates },
      radius: 1000 // Default radius
    }));
    
    setReplyText('');
    setIsReplying(false);
  };
  
  // Cancel replying to a message
  const handleReplyCancel = () => {
    setIsReplying(false);
    setReplyText('');
  };

  // Calculate distance from current location if available
  const calculateDistance = (messageLocation) => {
    if (!mapCenter || !messageLocation || !messageLocation.coordinates) return null;
    
    // Haversine formula to calculate distance between two points
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    
    const [lon1, lat1] = mapCenter.coordinates;
    const [lon2, lat2] = messageLocation.coordinates;
    
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    // Format distance
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    }
    return `${distance.toFixed(1)}km away`;
  };

  // Render message list header
  const renderHeader = () => (
    <div className="drawer-header flex-between items-center">
      <h2 className="m-0">Messages</h2>
      {onClose && (
        <button 
          className="btn btn-sm"
          onClick={onClose}
          aria-label="Close messages"
        >
          &times;
        </button>
      )}
    </div>
  );

  // Render a single message item
  const renderMessageItem = (message) => {
    const isSelected = selectedMessage && selectedMessage._id === message._id;
    const distance = calculateDistance(message.location);
    const isReply = message.parentMessageId !== null && message.parentMessageId !== undefined;
    const parentMessage = isReply ? messages.find(m => m._id === message.parentMessageId) : null;

    return (
      <div 
        key={message._id}
        className={`card hover-bg-gray mb-sm ${!message.read ? 'unread' : ''} ${isSelected ? 'selected' : ''} ${isReply ? 'is-reply' : ''}`}
        onClick={() => handleMessageClick(message)}
      >
        <div className="message-avatar">
          <div className="avatar-placeholder">{(message.senderName || 'A').charAt(0).toUpperCase()}</div>
          {!message.read && <span className="unread-indicator" />}
        </div>
        
        <div className="message-content">
          <div className="message-header">
            <span className="sender-name">{message.senderName || 'Anonymous'}</span>
            <span className="message-time">{formatDate(message.createdAt)}</span>
            <button 
              className="btn btn-icon btn-sm" 
              onClick={(e) => handleDeleteMessage(e, message._id)}
              aria-label="Delete message"
            >
              <span className="icon-close">×</span>
            </button>
          </div>
          
          {isReply && parentMessage && (
            <div className="reply-to-info">
              <small className="text-secondary">Replying to: </small>
              <small className="quoted-text">"{parentMessage.content.length > 50 ? `${parentMessage.content.substring(0, 50)}...` : parentMessage.content}"</small>
            </div>
          )}
          
          <p className="message-text">
            {isSelected || message.content.length <= 100 
              ? message.content 
              : `${message.content.substring(0, 100)}...`
            }
          </p>
          
          {distance && (
            <div className="message-distance">{distance}</div>
          )}
          
          {isSelected && !isReplying && (
            <div className="message-actions">
              <button 
                className="btn btn-sm btn-primary mt-xs"
                onClick={(e) => handleReplyClick(e, message)}
              >
                Reply
              </button>
            </div>
          )}
          
          {isSelected && isReplying && (
            <form className="reply-form mt-sm" onSubmit={handleReplySubmit}>
              <textarea 
                ref={replyInputRef}
                className="form-control"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                rows={3}
              />
              <div className="reply-actions mt-xs">
                <button 
                  type="button" 
                  className="btn btn-sm btn-secondary"
                  onClick={handleReplyCancel}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-sm btn-primary ml-xs"
                  disabled={!replyText.trim()}
                >
                  Send Reply
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
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
        {loading ? renderLoading() : 
         error ? renderError() :
         messages.length === 0 ? renderEmptyState() :
         (
           <>
             {messages && messages.length > 0 ? (
               messages.map(renderMessageItem)
             ) : (
               <div className="empty-state">No messages to display</div>
             )}
             {renderPagination()}
           </>
         )
        }
      </div>
    </div>
  );
};

export default MessageList;
