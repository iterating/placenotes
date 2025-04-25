import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectHiddenMessages, 
  unhideMessage,
  selectMessagesLoading
} from '../store/messageSlice';
import './MessageStyles.css';

/**
 * Component for displaying and managing hidden messages
 */
const HiddenMessages = ({ onClose }) => {
  const dispatch = useDispatch();
  const hiddenMessages = useSelector(selectHiddenMessages);
  const loading = useSelector(selectMessagesLoading);
  const [selectedMessages, setSelectedMessages] = useState([]);
  
  // Reset selection when messages change
  useEffect(() => {
    setSelectedMessages([]);
  }, [hiddenMessages]);
  
  // Handle message selection
  const handleSelectMessage = (messageId) => {
    setSelectedMessages(prev => {
      if (prev.includes(messageId)) {
        return prev.filter(id => id !== messageId);
      } else {
        return [...prev, messageId];
      }
    });
  };
  
  // Handle select all messages
  const handleSelectAll = () => {
    if (selectedMessages.length === hiddenMessages.length) {
      // If all are selected, deselect all
      setSelectedMessages([]);
    } else {
      // Otherwise select all
      setSelectedMessages(hiddenMessages.map(msg => msg._id));
    }
  };
  
  // Handle unhiding selected messages
  const handleUnhideSelected = () => {
    if (selectedMessages.length === 0) return;
    
    if (window.confirm(`Unhide ${selectedMessages.length} selected message(s)? They will reappear in your message list.`)) {
      selectedMessages.forEach(messageId => {
        dispatch(unhideMessage(messageId)).unwrap()
          .catch(error => {
            console.error('Failed to unhide message:', error);
            // Optionally show error to user
          });
      });
      setSelectedMessages([]);
    }
  };
  
  // Handle unhiding a single message
  const handleUnhideMessage = (e, messageId) => {
    e.stopPropagation();
    
    if (window.confirm('Unhide this message? It will reappear in your message list.')) {
      dispatch(unhideMessage(messageId)).unwrap()
        .catch(error => {
          console.error('Failed to unhide message:', error);
          // Optionally show error to user
        });
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }).format(date);
    } catch (error) {
      return 'Unknown date';
    }
  };
  
  return (
    <div className="drawer-content">
      <div className="messages-actions">
        <div className="select-all-container">
          <label className="checkbox-container">
            <input 
              type="checkbox"
              checked={selectedMessages.length === hiddenMessages.length && hiddenMessages.length > 0}
              onChange={handleSelectAll}
            />
            <span className="checkmark"></span>
            Select All ({hiddenMessages.length})
          </label>
        </div>
        
        <button 
          className="btn btn-primary btn-sm"
          disabled={selectedMessages.length === 0}
          onClick={handleUnhideSelected}
        >
          Unhide Selected
        </button>
      </div>
      
      {loading ? (
        <div className="loading-state flex-col flex-center">
          <div className="loading-spinner"></div>
          <p className="text-secondary">Loading hidden messages...</p>
        </div>
      ) : hiddenMessages.length === 0 ? (
        <div className="empty-state flex-col flex-center">
          <div className="empty-icon">🔍</div>
          <h3>No Hidden Messages</h3>
          <p className="text-secondary">You don't have any hidden messages.</p>
        </div>
      ) : (
        <div className="messages-container">
          {hiddenMessages.map(message => (
            <div 
              key={message._id}
              className={`message-card ${selectedMessages.includes(message._id) ? 'selected' : ''}`}
              onClick={() => handleSelectMessage(message._id)}
            >
              <div className="checkbox-wrapper">
                <input 
                  type="checkbox" 
                  checked={selectedMessages.includes(message._id)}
                  onChange={() => handleSelectMessage(message._id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              
              <div className="message-container">
                <div className="message-sender">
                  {message.senderName || 'Anonymous'}
                </div>
                <div className="message-content">
                  {message.content}
                </div>
                <div className="message-footer">
                  <span className="message-timestamp">
                    {formatDate(message.createdAt)}
                  </span>
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={(e) => handleUnhideMessage(e, message._id)}
                  >
                    Unhide
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HiddenMessages;
