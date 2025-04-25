import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../../../store/authSlice';
import { hideMessage, markMessageAsRead } from '../store/messageSlice';
import { calculateDistance, fromGeoJSONPoint, toGeoJSONPoint } from '../../../lib/GeoUtils';
import './MessageStyles.css';

/**
 * MessageItem component for rendering a single message
 */
const MessageItem = ({ 
  message, 
  onReply, 
  onDelete,
  parentMessage = null,
  showActions = true,
  isRoot = false,
  isReply = false,
  isPending = false,
  hasFailed = false
}) => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUser);
  
  // Calculate if the message was sent by the current user
  const isSentByCurrentUser = currentUser && message.senderId === currentUser._id;
  
  // Format date for display using native JS
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);

      // Format based on how long ago
      if (diffSec < 60) {
        return 'just now';
      } else if (diffMin < 60) {
        return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
      } else if (diffHour < 24) {
        return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
      } else if (diffDay < 7) {
        return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
      } else {
        // For older dates, just show the date
        return date.toLocaleDateString();
      }
    } catch (error) {
      return 'Unknown date';
    }
  };
  
  // Format the location information for display
  const formatLocation = () => {
    try {
      // Check if message or location is valid
      if (!message || !message.location) {
        return null;
      }
      
      // Validate location format
      if (!message.location.coordinates || 
          !Array.isArray(message.location.coordinates) || 
          message.location.coordinates.length !== 2) {
        return 'Location unavailable';
      }
      
      if (!currentUser || !currentUser.currentLocation) {
        return 'Location available';
      }
      
      // Calculate distance using GeoUtils with error handling
      try {
        const distance = calculateDistance(message.location, currentUser.currentLocation);
        
        if (distance === null || isNaN(distance)) {
          return 'Distance unknown';
        }
        
        // Format distance nicely
        if (distance < 0.1) {
          return 'Very close';
        } else if (distance < 1) {
          return 'Less than a mile away';
        } else {
          return `${Math.round(distance)} miles away`;
        }
      } catch (distanceError) {
        console.warn('Error calculating distance:', distanceError);
        return 'Distance calculation error';
      }
    } catch (error) {
      console.error('Error formatting location:', error);
      return 'Location error';
    }
  };
    
  // Handle hiding a message
  const handleHideMessage = (e) => {
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to hide this message? It will no longer appear in your message list.')) {
      if (onDelete) {
        // If parent component passed an onDelete handler, use it for backward compatibility
        onDelete(e, message._id);
      } else {
        dispatch(hideMessage(message._id)).unwrap()
          .catch(error => {
            console.error('Failed to hide message:', error);
            // Optionally show error to user
          });
      }
    }
  };
  
  const [isVisible, setIsVisible] = useState(false);
  const [isRead, setIsRead] = useState(message.read);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Mark the message as read when viewed
  useEffect(() => {
    // Validate message and required properties before proceeding
    if (!message || !message._id) {
      console.warn('Cannot mark invalid message as read');
      return;
    }
    
    if (isVisible && !isRead && !isSentByCurrentUser) {
      try {
        dispatch(markMessageAsRead(message._id))
          .unwrap()
          .then((result) => {
            if (result && result.success) {
              setIsRead(true);
              console.log('Message marked as read:', message._id);
            } else {
              console.warn('Unexpected result from markMessageAsRead:', result);
              // Still update UI state for better user experience
              setIsRead(true);
            }
          })
          .catch((error) => {
            console.error('Error marking message as read:', error);
            // Still update the UI state even when the API call fails
            setIsRead(true);
          });
      } catch (error) {
        console.error('Error dispatching markMessageAsRead:', error);
        setIsRead(true);
      }
    }
  }, [isVisible, isRead, isSentByCurrentUser, dispatch, message, message._id]);
  
  // Define class names based on message properties
  const messageClasses = [
    'card message-card mb-sm message-item',
    !isRead ? 'unread' : '',
    isReply || message.parentMessageId ? 'is-reply' : '',
    isRoot ? 'root' : '',
    isPending || message.pending ? 'pending' : '',
    hasFailed || message.sendFailed ? 'failed' : '',
    isSentByCurrentUser ? 'sent-by-me' : ''
  ].filter(Boolean).join(' ');
  
  return (
    <div className={messageClasses}>
      <div className="message-container">
        {/* Message header with sender info */}
        <div className="message-sender">
          {message.senderName || 'Anonymous'}
          {showActions && (
            <button 
              className="btn btn-icon btn-sm float-right" 
              onClick={handleHideMessage}
              aria-label="Hide message"
              title="Hide message"
            >
              <span className="icon-close">×</span>
            </button>
          )}
        </div>
        
        {/* If this is a reply, show what it's replying to */}
        {parentMessage && (
          <div className="reply-to-info">
            <span className="icon">↩</span>
            <span className="quoted-text">
              "{parentMessage.content && typeof parentMessage.content === 'string' 
                ? (parentMessage.content.length > 50 
                    ? `${parentMessage.content.substring(0, 50)}...` 
                    : parentMessage.content)
                : 'No content'}"
            </span>
          </div>
        )}
        
        {/* Message content */}
        <div className="message-content">
          {message && message.content ? message.content : 'No content'}
          {(isPending || (message && message.pending)) && (
            <div className="message-status-container">
              <span className="message-status pending">
                <span className="icon spin">⟳</span> Sending...
              </span>
            </div>
          )}
          {(hasFailed || (message && message.sendFailed)) && (
            <div className="message-status-container">
              <span className="message-status error">
                <span className="icon">⚠️</span> Failed to send
              </span>
              {message && message.errorMessage && (
                <span className="message-error-details">{message.errorMessage}</span>
              )}
              <button 
                className="btn btn-sm btn-retry" 
                onClick={(e) => {
                  try {
                    e.stopPropagation();
                    if (onReply && typeof onReply === 'function') {
                      onReply(message);
                    }
                  } catch (error) {
                    console.error('Error in retry button handler:', error);
                  }
                }}
              >
                Retry
              </button>
            </div>
          )}
        </div>
        
        {/* Location and timestamp */}
        <div className="message-footer">
          <div className="message-location">
            <span className="icon">📍</span>
            <span>{formatLocation()}</span>
          </div>
          <div className="message-timestamp">
            {message && message.createdAt ? formatDate(message.createdAt) : 'Unknown time'}
          </div>
        </div>
        
        {/* Action buttons */}
        {showActions && !isSentByCurrentUser && !isPending && !hasFailed && (
          <div className="message-actions">
            <button 
              className="btn btn-sm btn-primary"
              onClick={() => onReply?.(message)}
            >
              <span className="icon mr-xs">↩</span>
              Reply
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
