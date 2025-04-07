import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchMessageThread,
  selectMessageById,
  selectMessageThread
} from '../messagesSlice';
import MessageItem from './MessageItem';
import MessageCompose from './MessageCompose';
import './MessageStyles.css';

/**
 * MessageThread component - displays a conversation thread between users
 */
const MessageThread = ({ threadId, onClose }) => {
  const dispatch = useDispatch();
  const [isReplying, setIsReplying] = useState(false);
  
  // Get the root message and its thread from Redux store
  const rootMessage = useSelector(state => selectMessageById(state, threadId));
  const threadMessages = useSelector(state => selectMessageThread(state, threadId));
  const loading = useSelector(state => state.messages.refreshing);
  
  // Fetch the message thread on component mount
  useEffect(() => {
    if (threadId) {
      dispatch(fetchMessageThread(threadId));
    }
  }, [dispatch, threadId]);
  
  // Handle starting a reply
  const handleReply = (message) => {
    setIsReplying(true);
  };
  
  // Handle canceling a reply
  const handleCancelReply = () => {
    setIsReplying(false);
  };
  
  // After sending a reply, refresh the thread and reset state
  const handleReplySent = () => {
    setIsReplying(false);
    dispatch(fetchMessageThread(threadId));
  };
  
  if (!rootMessage) {
    return (
      <div className="message-thread card">
        <div className="thread-header">
          <h3>Message Thread</h3>
          <button 
            className="btn btn-icon btn-sm"
            onClick={onClose}
            aria-label="Close"
          >
            <span className="icon-close">×</span>
          </button>
        </div>
        {loading ? (
          <div className="loading-indicator">Loading conversation...</div>
        ) : (
          <div className="empty-state">Message not found</div>
        )}
      </div>
    );
  }
  
  // Sort messages by creation date
  const sortedMessages = [rootMessage, ...threadMessages].sort((a, b) => 
    new Date(a.createdAt) - new Date(b.createdAt)
  );
  
  return (
    <div className="message-thread card">
      <div className="thread-header">
        <h3>
          <span className="icon mr-xs">💬</span>
          Conversation with {rootMessage.senderName || 'User'}
        </h3>
        <button 
          className="btn btn-icon btn-sm"
          onClick={onClose}
          aria-label="Close"
        >
          <span className="icon-close">×</span>
        </button>
      </div>
      
      <div className="thread-messages">
        {loading && <div className="loading-indicator">Updating conversation...</div>}
        
        {sortedMessages.map(message => (
          <MessageItem 
            key={message._id}
            message={message}
            onReply={() => handleReply(message)}
            showThread={false}
          />
        ))}
      </div>
      
      {isReplying && (
        <div className="thread-reply">
          <MessageCompose 
            parentMessage={rootMessage}
            onCancel={handleCancelReply}
            onMessageSent={handleReplySent}
          />
        </div>
      )}
      
      {!isReplying && (
        <div className="thread-actions">
          <button 
            className="btn btn-primary"
            onClick={() => handleReply(rootMessage)}
          >
            <span className="icon mr-xs">↩</span>
            Reply to Conversation
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageThread;
