import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectMessages, 
  selectLoading, 
  selectError,
  selectPagination
} from '../../../store/messageSlice';
import { fetchMessages, markMessageAsRead, fetchMessagesByLocation } from '../../../store/messageStoreAction';
import './MessageList.css';

const MessageList = ({ isOpen, onClose, mapCenter }) => {
  const dispatch = useDispatch();
  const messages = useSelector(selectMessages);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const pagination = useSelector(selectPagination);
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Fetch messages when component mounts or when map center changes
  useEffect(() => {
    if (isOpen) {
      if (mapCenter && mapCenter.coordinates) {
        // If map center is available, fetch messages by location
        dispatch(fetchMessagesByLocation({
          location: {
            type: 'Point',
            coordinates: mapCenter.coordinates
          },
          radius: 5000 // Default radius in meters
        }));
      } else {
        // Otherwise fetch all messages
        dispatch(fetchMessages());
      }
    }
  }, [dispatch, isOpen, mapCenter]);

  // Handle message click - mark as read and show details
  const handleMessageClick = (message) => {
    if (!message.read) {
      dispatch(markMessageAsRead(message._id));
    }
    setSelectedMessage(message._id === selectedMessage?._id ? null : message);
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
    <div className="message-list-header">
      <h2>Messages</h2>
      {onClose && (
        <button 
          className="close-button"
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

    return (
      <div 
        key={message._id}
        className={`message-item ${!message.read ? 'unread' : ''} ${isSelected ? 'selected' : ''}`}
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
          </div>
          
          <p className="message-text">
            {isSelected || message.content.length <= 100 
              ? message.content 
              : `${message.content.substring(0, 100)}...`
            }
          </p>
          
          {distance && (
            <div className="message-distance">{distance}</div>
          )}
        </div>
      </div>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <div className="empty-state">
      <div className="empty-icon">📭</div>
      <h3>No Messages</h3>
      <p>You don't have any messages yet.</p>
    </div>
  );

  // Render loading state
  const renderLoading = () => (
    <div className="loading-state">
      <div className="loading-spinner"></div>
      <p>Loading messages...</p>
    </div>
  );

  // Render error state
  const renderError = () => (
    <div className="error-state">
      <div className="error-icon">⚠️</div>
      <h3>Error</h3>
      <p>{error || 'Failed to load messages'}</p>
      <button onClick={() => dispatch(fetchMessages())}>
        Try Again
      </button>
    </div>
  );

  // Render pagination controls if needed
  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    
    return (
      <div className="pagination-controls">
        <button 
          disabled={pagination.currentPage === 1}
          onClick={() => dispatch(fetchMessages(pagination.currentPage - 1))}
        >
          Previous
        </button>
        <span>{pagination.currentPage} of {pagination.totalPages}</span>
        <button 
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
    <div className="message-list">
      {renderHeader()}
      
      <div className="message-list-content">
        {loading ? renderLoading() : 
         error ? renderError() :
         messages.length === 0 ? renderEmptyState() :
         (
           <>
             <div className="message-items">
               {messages.map(renderMessageItem)}
             </div>
             {renderPagination()}
           </>
         )
        }
      </div>
    </div>
  );
};

export default MessageList;
