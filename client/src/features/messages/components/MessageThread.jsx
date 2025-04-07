import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchMessageThread,
  selectMessageById,
  selectMessageThread,
  selectMessagesLoading,
  selectMessagesRefreshing,
  selectMessagesError,
  selectSelectedMessageId,
  selectConversationById,
  selectConversationMessages,
  selectSelectedConversation,
  selectUser
} from '../store/messageSlice';
import { selectUser as selectAuthUser } from '../../../store/authSlice';
import MessageItem from './MessageItem';
import MessageCompose from './MessageCompose';
import './MessageStyles.css';

/**
 * MessageThread component - displays a conversation thread between users
 * Can display either a message thread (replies to a message) or a conversation (all messages between users)
 */
const MessageThread = ({ threadId, conversationId, onClose }) => {
  const dispatch = useDispatch();
  const [isReplying, setIsReplying] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Get current user for display purposes
  const currentUser = useSelector(selectAuthUser);
  
  // Support both thread and conversation modes
  const selectedConversation = useSelector(selectSelectedConversation);
  const activeConversationId = conversationId || selectedConversation;
  
  // Get data based on whether we're showing a thread or conversation
  const rootMessage = useSelector(state => selectMessageById(state, threadId));
  const threadMessages = useSelector(state => threadId ? selectMessageThread(state, threadId) : []);
  const conversationMessages = useSelector(state => activeConversationId ? 
    selectConversationMessages(state, activeConversationId) : []);
  
  // Use the appropriate messages based on mode
  const messages = threadId ? 
    (rootMessage ? [rootMessage, ...threadMessages].filter(Boolean) : []) : 
    conversationMessages;
  const conversation = useSelector(state => activeConversationId ? 
    selectConversationById(state, activeConversationId) : null);
  const loading = useSelector(selectMessagesLoading);
  const refreshing = useSelector(selectMessagesRefreshing);
  
  // Fetch the message thread on component mount
  useEffect(() => {
    if (threadId) {
      dispatch(fetchMessageThread(threadId));
    }
  }, [dispatch, threadId]);
  
  // Scroll to bottom of messages when they update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);
  
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
    if (threadId) {
      dispatch(fetchMessageThread(threadId));
    }
  };
  
  // Return appropriate UI based on mode (thread or conversation)
  if (!threadId && !activeConversationId) {
    return (
      <div className="message-thread card">
        <div className="thread-header">
          <h3>Messages</h3>
          <button className="close-button" onClick={onClose}>
            <span className="icon">←</span>
          </button>
        </div>
        <div className="thread-body">
          <div className="empty-state">No conversation selected</div>
        </div>
      </div>
    );
  }
  
  if (threadId && !rootMessage) {
    return (
      <div className="message-thread card">
        <div className="thread-header">
          <h3>Message Thread</h3>
          <button className="close-button" onClick={onClose}>
            <span className="icon">←</span>
          </button>
        </div>
        <div className="thread-body">
          {loading ? (
            <div className="loading-indicator">Loading thread...</div>
          ) : (
            <div className="empty-state">Message not found</div>
          )}
        </div>
      </div>
    );
  }
  
  // Sort messages by creation date
  const sortedMessages = [rootMessage, ...threadMessages].sort((a, b) => 
    new Date(a.createdAt) - new Date(b.createdAt)
  );
  
  // Get title based on mode
  const getTitle = () => {
    if (threadId && rootMessage) {
      const senderName = rootMessage.senderName || 'User';
      return `Message from ${senderName}`;
    }
    if (conversation) {
      // Find the other participant (not current user)
      const otherParticipant = conversation.participants.find(p => 
        p !== currentUser?._id);
      // Try to get username from conversation messages
      const otherUserMessage = messages.find(m => m.senderId === otherParticipant);
      const otherUserName = otherUserMessage ? otherUserMessage.senderName : 'User';
      return `Conversation with ${otherUserName}`;
    }
    return 'Messages';
  };
  
  return (
    <div className="message-thread card">
      <div className="thread-header">
        <h3>{getTitle()}</h3>
        <button className="close-button" onClick={onClose}>
          <span className="icon">←</span>
        </button>
      </div>
      
      <div className="thread-body">
        {/* Display messages - either thread or conversation */}
        {messages && messages.length > 0 ? (
          <div className="thread-messages">
            {messages.map(message => (
              <MessageItem
                key={message._id}
                message={message}
                onReply={handleReply}
                isRoot={threadId && message._id === threadId}
                isReply={message.parentMessageId && message.parentMessageId !== message._id}
              />
            ))}
            <div ref={messagesEndRef} /> {/* Element to scroll to */}
          </div>
        ) : (
          !loading && !refreshing && (
            <div className="empty-replies">
              {threadId ? 'No replies yet' : 'No messages in this conversation'}
            </div>
          )
        )}
        
        {/* Loading indicator */}
        {(loading || refreshing) && <div className="loading-indicator">Loading messages...</div>}
        
        {/* Reply form */}
        {isReplying && (
          <div className="reply-form">
            <MessageCompose
              parentMessage={threadId ? rootMessage : null}
              conversationId={activeConversationId}
              onCancel={handleCancelReply}
              onSuccess={handleReplySent}
            />
          </div>
        )}
        
        {/* Quick reply button */}
        {!isReplying && (
          <div className="quick-reply-button">
            <button 
              className="btn btn-primary" 
              onClick={() => setIsReplying(true)}
            >
              Reply
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageThread;
