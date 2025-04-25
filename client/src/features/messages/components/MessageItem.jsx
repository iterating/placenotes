import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../../../store/authSlice';
import { markMessageAsRead } from '../store/messageSlice';
import { formatDateRelative, formatLocationDistance } from '../../../lib/FormatUtils';
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
  hasFailed = false,
}) => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUser);
  
  const isSentByCurrentUser = currentUser && message.senderId === currentUser._id;
  
  const handleHideMessage = (e) => {
    e.stopPropagation();
    
    if (onDelete) {
      if (window.confirm('Are you sure you want to hide this message?')) {
         onDelete(message._id); 
      }
    } else {
      console.warn('MessageItem: onDelete prop is missing, cannot hide message.');
    }
  };
  
  const [isVisible, setIsVisible] = useState(false);
  const [isRead, setIsRead] = useState(message?.read || false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10); 
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!message || !message._id) {
      return;
    }
    
    if (isVisible && !isRead && !isSentByCurrentUser) {
      try {
        dispatch(markMessageAsRead(message._id))
          .unwrap()
          .then(() => {
            setIsRead(true); 
          })
          .catch((error) => {
            console.error(`Error marking message ${message._id} as read:`, error);
          });
      } catch (error) {
        console.error('Error dispatching markMessageAsRead:', error);
      }
    }
  }, [isVisible, isRead, isSentByCurrentUser, dispatch, message?._id]); 
  
  const messageClasses = [
    'card message-card mb-sm message-item',
    !isRead ? 'unread' : '',
    isReply || message?.parentMessageId ? 'is-reply' : '',
    isRoot ? 'root' : '',
    isPending || message?.pending ? 'pending' : '',
    hasFailed || message?.sendFailed ? 'failed' : '',
    isSentByCurrentUser ? 'sent-by-me' : ''
  ].filter(Boolean).join(' ');
  
  if (!message) {
    return <div className="card message-card mb-sm message-item error">Message data is missing.</div>;
  }

  return (
    <div className={messageClasses}>
      <div className="message-container">
        <div className="message-sender">
          {message.senderName || 'Anonymous'}
          {showActions && onDelete && (
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
        
        <div className="message-body">
          <p className="message-content">{message.content}</p>
        </div>
        
        <div className="message-footer">
          <span className="message-timestamp" title={new Date(message.createdAt).toLocaleString()}>
            {formatDateRelative(message.createdAt)} 
          </span>
          {message.location && (
            <span className="message-location">
              <span className="icon">📍</span>
              {formatLocationDistance(message.location, currentUser?.currentLocation)}
            </span>
          )}
          {showActions && onReply && !isPending && !hasFailed && (
            <button 
              className="btn btn-link btn-sm reply-button" 
              onClick={(e) => { e.stopPropagation(); onReply(message); }}
            >
              Reply
            </button>
          )}
          {isPending && <span className="status-indicator pending">Sending...</span>}
          {hasFailed && <span className="status-indicator failed">Failed</span>}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
