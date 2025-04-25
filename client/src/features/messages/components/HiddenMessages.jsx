import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectHiddenMessages, 
  unhideMessage,
  selectMessagesLoading
} from '../store/messageSlice';
import { useSelectionState } from '../../../hooks/useSelectionState';
import { formatDateRelative } from '../../../lib/FormatUtils';
import './MessageStyles.css';

/**
 * Component for displaying and managing hidden messages
 */
const HiddenMessages = () => {
  const dispatch = useDispatch();
  const hiddenMessages = useSelector(selectHiddenMessages);
  const loading = useSelector(selectMessagesLoading);

  const {
    selectedItems, 
    handleSelectItem,
    toggleSelectAll,
    isAllSelected,
    clearSelection
  } = useSelectionState(hiddenMessages);

  const handleUnhideSelected = () => {
    if (selectedItems.size === 0) return;
    
    const selectedIdsArray = Array.from(selectedItems);

    if (window.confirm(`Unhide ${selectedIdsArray.length} selected message(s)? They will reappear in your message list.`)) {
      selectedIdsArray.forEach(messageId => {
        dispatch(unhideMessage(messageId)).unwrap()
          .catch(error => {
            console.error('Failed to unhide message:', messageId, error);
          });
      });
      clearSelection();
    }
  };
  
  const handleUnhideMessage = (e, messageId) => {
    e.stopPropagation();
    
    if (window.confirm('Unhide this message? It will reappear in your message list.')) {
      dispatch(unhideMessage(messageId)).unwrap()
        .catch(error => {
          console.error('Failed to unhide message:', messageId, error);
        });
    }
  };
  
  return (
    <div className="drawer-content">
      <div className="messages-actions">
        <div className="select-all-container">
          <label className="checkbox-container">
            <input 
              type="checkbox"
              checked={isAllSelected}
              onChange={toggleSelectAll}
              disabled={hiddenMessages.length === 0}
            />
            <span className="checkmark"></span>
            Select All ({selectedItems.size} / {hiddenMessages.length})
          </label>
        </div>
        
        <button 
          className="btn btn-primary btn-sm"
          onClick={handleUnhideSelected}
          disabled={selectedItems.size === 0}
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
              className={`message-card ${selectedItems.has(message._id) ? 'selected' : ''}`}
              onClick={() => handleSelectItem(message._id)}
            >
              <div className="checkbox-wrapper">
                <input 
                  type="checkbox" 
                  checked={selectedItems.has(message._id)}
                  onChange={() => handleSelectItem(message._id)}
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
                    {formatDateRelative(message.createdAt)}
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
