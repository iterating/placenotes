import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../../../store/authSlice';
import { hideMessage, markMessageAsRead } from '../store/messageSlice';
import './MessageStyles.css';

/**
 * MessageItem component for rendering a single message
 */
const MessageItem = ({ 
  message, 
  onReply, 
  onDelete,
  parentMessage = null,
  showActions = true 
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
    if (!message.location || !message.location.coordinates) {
      return null;
    }
    
    // Just show "X miles away" instead of exact coordinates for privacy
    const lat = message.location.coordinates[1];
    const lng = message.location.coordinates[0];
    
    if (!currentUser || !currentUser.currentLocation) {
      return 'Location available';
    }
    
    // Calculate approximate distance
    const userLat = currentUser.currentLocation.coordinates[1];
    const userLng = currentUser.currentLocation.coordinates[0];
    const distance = calculateDistance(userLat, userLng, lat, lng);
    
    return `${distance} away`;
  };
  
  // Calculate approximate distance between two points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3958.8; // Earth's radius in miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    // Format distance nicely
    if (distance < 0.1) {
      return 'Very close';
    } else if (distance < 1) {
      return 'Less than a mile away';
    } else {
      return `${Math.round(distance)} miles away`;
    }
  };
  
  // Convert degrees to radians
  const toRad = (value) => value * Math.PI / 180;
  
  // Handle hiding a message
  const handleHideMessage = (e) => {
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to hide this message? It will no longer appear in your message list.')) {
      if (onDelete) {
        // If parent component passed an onDelete handler, use it for backward compatibility
        onDelete(e, message._id);
      } else {
        dispatch(hideMessage(message._id));
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
    if (isVisible && !isRead && !isSentByCurrentUser) {
      try {
        dispatch(markMessageAsRead(message._id))
          .unwrap()
          .then((result) => {
            if (result.success) {
              setIsRead(true);
              console.log('Message marked as read:', message._id);
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
  }, [isVisible, isRead, isSentByCurrentUser, dispatch, message._id]);
  
  // Define class names based on message properties
  const messageClasses = [
    'card message-card mb-sm',
    !isRead ? 'unread' : '',
    message.parentMessageId ? 'is-reply' : '',
    isSentByCurrentUser ? 'sent-by-me' : ''
  ].filter(Boolean).join(' ');
  
  return (
    <div className={messageClasses}>
      <div className="message-container">
        {/* Message header with sender info */}
        <div className="message-sender">
          {message.senderName || 'Anonymous'}
          {isSentByCurrentUser && showActions && (
            <button 
              className="btn btn-icon btn-sm float-right" 
              onClick={handleHideMessage}
              aria-label="Hide message"
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
              "{parentMessage.content.length > 50 
                ? `${parentMessage.content.substring(0, 50)}...` 
                : parentMessage.content}"
            </span>
          </div>
        )}
        
        {/* Message content */}
        <div className="message-content">
          {message.content}
        </div>
        
        {/* Location and timestamp */}
        <div className="message-footer">
          <div className="message-location">
            <span className="icon">📍</span>
            <span>{formatLocation()}</span>
          </div>
          <div className="message-timestamp">{formatDate(message.createdAt)}</div>
        </div>
        
        {/* Action buttons */}
        {showActions && !isSentByCurrentUser && (
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
