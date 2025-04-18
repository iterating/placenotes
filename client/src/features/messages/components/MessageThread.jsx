import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchMessageThread,
  fetchMessages,
  hideMessage,
  selectMessageById,
  sendMessage,
  markMessageAsRead
} from '../store/messageSlice';
import { selectUser as selectAuthUser } from '../../../store/authSlice';
import MessageItem from './MessageItem';
import MessageCompose from './MessageCompose';
import './MessageStyles.css';

/**
 * Simplified MessageThread component - displays a message thread and allows replies
 */
const MessageThread = ({ threadId, onClose }) => {
  const dispatch = useDispatch();
  const [isReplying, setIsReplying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [threadData, setThreadData] = useState({
    rootMessage: null,
    replies: [],
    allMessages: []
  });
  const messagesEndRef = useRef(null);
  
  // Get current user for display purposes
  const currentUser = useSelector(selectAuthUser);
  
  // Get the root message from Redux store if available
  const rootMessage = useSelector(state => threadId ? selectMessageById(state, threadId) : null);
  
  // Organize messages into root and replies
  const threadRootMessage = threadData.rootMessage;
  
  // Sort replies by date for display
  const sortedReplies = threadData.replies
    .filter(Boolean)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
  // Combine root message and replies for display
  const sortedMessages = threadRootMessage ? [threadRootMessage, ...sortedReplies] : sortedReplies;
  
  // Fetch the message thread on component mount or when threadId changes
  useEffect(() => {
    if (!threadId) return;
    
    console.log(`MessageThread: Fetching thread for ID ${threadId}`);
    setError(null);
    setLoading(true);
    
    // Add error handling boundary to prevent component crashes
    try {
      // Mark the message as read when opening the thread
      dispatch(markMessageAsRead(threadId));
      
      dispatch(fetchMessageThread(threadId))
        .unwrap()
        .then((result) => {
          console.log('MessageThread: Successfully fetched thread data', result);
          setLoading(false);
          
          if (!result || !result.rootMessage) {
            setError('Could not load message data');
            return;
          }
          
          if (result.mockData) {
            console.log('MessageThread: Displaying mock data');
          }
          
          setThreadData(result);
        })
        .catch((error) => {
          console.error('MessageThread: Error fetching thread data', error);
          setLoading(false);
          setError(error.message || 'Failed to load the message thread');
        });
    } catch (error) {
      console.error('MessageThread: Critical error in fetch effect', error);
      setLoading(false);
      setError('Something went wrong while loading the message');
    }
  }, [dispatch, threadId]);
  
  // Scroll to bottom of messages when they update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sortedMessages.length]);
  
  // Render the sender's name with fallbacks
  const renderSender = (message) => {
    if (!message) return 'Unknown';
    
    return message.senderName || 
           (message.sender && (message.sender.username || message.sender.name || message.sender.email)) || 
           'Unknown';
  };

  // Format message content with line breaks
  const formatContent = (content) => {
    if (!content) return '';
    
    try {
      return content.split('\n').map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < content.split('\n').length - 1 && <br />}
        </React.Fragment>
      ));
    } catch (err) {
      return String(content);
    }
  };

  // Reply handling
  const handleReply = () => setIsReplying(true);
  const handleCancelReply = () => setIsReplying(false);
  
  // Handle sending a reply
  const handleSendReply = (replyContent) => {
    if (!replyContent || !threadData?.rootMessage?._id) return;
    
    setIsReplying(false); // Close reply form
    
    // Add location data to the reply if available
    const currentLocation = JSON.parse(sessionStorage.getItem("currentLocation")) || null;
    let locationData = null;
    
    if (currentLocation) {
      if (currentLocation.type === 'Point' && Array.isArray(currentLocation.coordinates)) {
        locationData = currentLocation;
      } else if (currentLocation.latitude && currentLocation.longitude) {
        // Convert legacy format to GeoJSON Point
        locationData = {
          type: 'Point',
          coordinates: [currentLocation.longitude, currentLocation.latitude]
        };
      }
    }
    
    const replyData = {
      content: replyContent,
      parentMessageId: threadData.rootMessage._id,
      location: locationData,
      radius: 1000 // Default radius in meters
    };
    
    try {
      // Show optimistic UI update first
      const optimisticReply = {
        _id: 'temp_' + Date.now(),
        content: replyContent,
        createdAt: new Date().toISOString(),
        senderId: currentUser?._id || 'current_user',
        senderName: currentUser?.name || 'You',
        parentMessageId: threadData.rootMessage._id,
        read: true,
        hidden: false,
        pending: true
      };
      
      // Update local state immediately with optimistic reply
      setThreadData(prev => ({
        ...prev,
        replies: [...(prev.replies || []), optimisticReply],
        allMessages: [...(prev.allMessages || []), optimisticReply]
      }));
      
      // Then send to server
      dispatch(sendMessage(replyData))
        .unwrap()
        .then((response) => {
          console.log('Reply sent successfully', response);
          
          // Refresh the thread to include the new reply from server
          if (threadId) {
            dispatch(fetchMessageThread(threadId));
          }
        })
        .catch((error) => {
          console.error('Error sending reply:', error);
          
          // If the server API fails, keep the optimistic update but mark as failed
          const failedReply = {
            ...optimisticReply,
            _id: 'mock_' + Date.now(),
            sendFailed: true,
            mock: true
          };
          
          // Update local state with failed reply
          setThreadData(prev => {
            // Remove the optimistic reply
            const filteredReplies = prev.replies.filter(r => r._id !== optimisticReply._id);
            const filteredAllMessages = prev.allMessages.filter(m => m._id !== optimisticReply._id);
            
            return {
              ...prev,
              replies: [...filteredReplies, failedReply],
              allMessages: [...filteredAllMessages, failedReply]
            };
          });
          
          console.log('Added failed reply locally', failedReply);
        });
    } catch (error) {
      console.error('Critical error in handleSendReply:', error);
    }
  };
  
  const handleReplySent = () => {
    setIsReplying(false);
    if (threadId) {
      dispatch(fetchMessageThread(threadId));
    }
  };
  
  // Get the title for the message thread
  const getTitle = () => {
    const rootMsg = threadData.rootMessage;
    if (rootMsg) {
      return `Message from ${renderSender(rootMsg)}`;
    }
    return 'Message Thread';
  };
  
  // If no threadId provided, show empty state
  if (!threadId) {
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
  
  return (
    <div className="message-thread card">
      <div className="thread-header">
        <h3>{getTitle()}</h3>
        <button className="close-button" onClick={onClose}>
          <span className="icon">←</span>
        </button>
      </div>
      
      <div className="thread-body">
        {/* Loading state */}
        {loading && <div className="loading-indicator">Loading messages...</div>}
        
        {/* Error state */}
        {error && (
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <div>
              <p>{error}</p>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => dispatch(fetchMessageThread(threadId))}
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        
        {/* Messages */}
        {!loading && !error && sortedMessages.length > 0 ? (
          <div className="thread-messages">
            {/* Root message */}
            {threadRootMessage && (
              <div className="root-message-container">
                <MessageItem
                  key={threadRootMessage._id}
                  message={threadRootMessage}
                  onReply={handleReply}
                  onDelete={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Hide this message?')) {
                      dispatch(hideMessage(rootMessage._id));
                      onClose && onClose();
                    }
                  }}
                  isRoot={true}
                  isReply={false}
                  content={formatContent(rootMessage.content)}
                />
              </div>
            )}
            
            {/* Replies section */}
            {sortedReplies.length > 0 && (
              <div className="replies-section">
                <div className="replies-divider">
                  <span>{sortedReplies.length} {sortedReplies.length === 1 ? 'Reply' : 'Replies'}</span>
                </div>
                
                {sortedReplies.map(message => (
                  <MessageItem
                    key={message._id}
                    message={message}
                    onReply={handleReply}
                    onDelete={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Hide this message?')) {
                        dispatch(hideMessage(message._id));
                      }
                    }}
                    isRoot={false}
                    isReply={true}
                    isPending={message.pending}
                    hasFailed={message.sendFailed}
                    content={formatContent(message.content)}
                  />
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : (!loading && !error) ? (
          <div className="empty-replies">No messages in this thread</div>
        ) : null}
        
        {/* Reply form */}
        {!loading && !error && (
          isReplying ? (
            <div className="reply-form">
              <MessageCompose
                parentMessage={threadData.rootMessage}
                onCancel={handleCancelReply}
                onSuccess={handleSendReply}
              />
            </div>
          ) : (
            <div className="quick-reply-button">
              <button className="btn btn-primary" onClick={handleReply}>
                Reply
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default MessageThread;
