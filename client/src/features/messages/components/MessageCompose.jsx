import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessage } from '../../../store/messageStoreAction';
import { selectUser } from '../../../store/authSlice';
import RecipientSelector from './RecipientSelector';
import './MessageStyles.css';

const MessageCompose = ({ onCancel, mapCenter, parentMessage }) => {
  const [recipientId, setRecipientId] = useState(parentMessage?.senderId || '');
  const [recipientName, setRecipientName] = useState(parentMessage?.senderName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [message, setMessage] = useState('');
  
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUser);
  const messageInputRef = useRef(null);
  
  // Focus on message input when recipient is selected
  useEffect(() => {
    if (recipientId && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [recipientId]);
  
  // Handle recipient selection from RecipientSelector
  const handleSelectRecipient = (user) => {
    setRecipientId(user._id);
    setRecipientName(user.username || user.name || user.email);
    // Clear any previous errors
    setError('');
  };
  

  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }
    
    if (!recipientId) {
      setError('Please select a recipient');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // Prepare message data
    const messageData = {
      content: message,
      recipientId: recipientId,
      parentMessageId: parentMessage?._id || null,
      location: mapCenter || {
        // Default location if mapCenter isn't available
        type: 'Point',
        coordinates: [-118.243683, 34.052235] // Default coordinates
      },
      radius: 1000 // Default radius in meters
    };
    
    // Dispatch the sendMessage action with Redux
    dispatch(sendMessage(messageData))
      .unwrap()
      .then(() => {
        setSuccess('Message sent successfully!');
        setMessage('');
        setRecipientId('');
        setRecipientName('');
        
        // Clear success message after a delay
        setTimeout(() => {
          setSuccess('');
          if (onCancel) onCancel();
        }, 1500);
      })
      .catch((err) => {
        console.error('Error sending message:', err);
        setError(`Failed to send message: ${err.message || 'Unknown error'}`);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  return (
    <div className="compose-form card mb-md">
      <div className="card-header">
        <h4 className="m-0">
          {parentMessage ? (
            <>
              <span className="icon mr-xs">↩</span> Reply to Message
            </>
          ) : (
            <>
              <span className="icon mr-xs">✉️</span> New Message
            </>
          )}
        </h4>
        <button 
          className="btn btn-icon btn-sm"
          onClick={onCancel}
          aria-label="Cancel"
        >
          <span className="icon-close">×</span>
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* If replying, show original message */}
        {parentMessage && (
          <div className="reply-to-message">
            <div className="reply-indicator">
              <span className="icon">↩</span> Replying to:
            </div>
            <div className="original-message">
              <p className="message-content">{parentMessage.content}</p>
            </div>
          </div>
        )}

        {/* Recipient Selector - only show if not replying */}
        {!parentMessage && <RecipientSelector onSelectRecipient={handleSelectRecipient} />}
        
        {recipientId && (
          <div className="selected-recipient">
            <span className="recipient-label">To:</span>
            <span className="recipient-value">{recipientName}</span>
          </div>
        )}
        
        {/* Error and Success messages */}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        {/* Message Input */}
        <div className="form-group">
          <label htmlFor="message-input" className="form-label">
            <span className="icon mr-xs">💬</span> Message:
          </label>
          <textarea
            id="message-input"
            ref={messageInputRef}
            className="form-control"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={parentMessage ? "Type your reply here..." : "Type your message here..."}
            rows={4}
            disabled={loading}
            required
          />
        </div>
        
        {/* Location Info */}
        <div className="text-secondary mt-xs text-sm location-info">
          <small>
            <span className="mr-xs">📍</span>
            {mapCenter ? 
              'Your current location will be attached to this message' : 
              'Using default location for this message'}
          </small>
        </div>
        
        {/* Action Buttons */}
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-sm btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            <span className="icon mr-xs">✕</span> Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-sm btn-primary ml-xs"
            disabled={loading || !message.trim() || !recipientId}
          >
            {loading ? (
              <>
                <span className="icon spin mr-xs">⟳</span> Sending...
              </>
            ) : parentMessage ? (
              <>
                <span className="icon mr-xs">↩</span> Send Reply
              </>
            ) : (
              <>
                <span className="icon mr-xs">➤</span> Send Message
              </>
            )}
          </button>
        </div>
      </form>
    </div>
);
};

export default MessageCompose;
