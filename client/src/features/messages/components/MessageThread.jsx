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
import { getCurrentLocationFromStorage, toGeoJSONPoint } from '../../../lib/GeoUtils';
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
  
  // Sort replies by date for display with error handling
  const sortedReplies = threadData.replies
    ? threadData.replies
        .filter(Boolean)
        .sort((a, b) => {
          try {
            return new Date(a.createdAt) - new Date(b.createdAt);
          } catch (error) {
            console.warn('Error sorting messages by date:', error);
            return 0; // Keep original order if date comparison fails
          }
        })
    : [];
    
  // Combine root message and replies for display
  const sortedMessages = threadRootMessage ? [threadRootMessage, ...sortedReplies] : sortedReplies;
  
  // Fetch the message thread on component mount or when threadId changes
  useEffect(() => {
    if (!threadId) return;
    
    console.log(`MessageThread: Fetching thread for ID ${threadId}`);
    setError(null);
    setLoading(true);
    
    // Reset thread data when loading a new thread
    setThreadData({
      rootMessage: null,
      replies: [],
      allMessages: []
    });
    
    // Add error handling boundary to prevent component crashes
    try {
      // Mark the message as read when opening the thread
      try {
        dispatch(markMessageAsRead(threadId));
      } catch (readError) {
        // Don't fail the entire thread load if marking as read fails
        console.warn('Error marking message as read:', readError);
      }
      
      // Fetch the thread data
      dispatch(fetchMessageThread(threadId))
        .unwrap()
        .then((result) => {
          console.log('MessageThread: Successfully fetched thread data', result);
          setLoading(false);
          
          if (!result) {
            setError('Could not load message data');
            return;
          }
          
          // Validate rootMessage
          if (!result.rootMessage) {
            console.warn('MessageThread: Missing root message in response');
            setError('Could not load message data - root message missing');
            return;
          }
          
          // Ensure replies is always an array
          const validatedResult = {
            ...result,
            replies: Array.isArray(result.replies) ? result.replies : [],
            allMessages: Array.isArray(result.allMessages) ? result.allMessages : []
          };
          
          if (result.mockData) {
            console.log('MessageThread: Displaying mock data');
          }
          
          setThreadData(validatedResult);
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
    if (!replyContent || !threadRootMessage) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // Get current location
    let currentLocation;
    try {
      currentLocation = getCurrentLocationFromStorage();
      if (!currentLocation) {
        throw new Error('Location not available');
      }
    } catch (locationError) {
      console.warn('Could not get current location:', locationError);
      // Fallback to default location
      currentLocation = toGeoJSONPoint({
        latitude: 34.052235,
        longitude: -118.243683
      });
    }
    
    // Create message data
    const messageData = {
      content: replyContent,
      recipientId: threadRootMessage.senderId,
      parentMessageId: threadRootMessage._id,
      location: currentLocation,
      // Include sender information for optimistic updates
      senderId: currentUser?._id,
      senderName: currentUser?.username || currentUser?.name || 'You'
    };
    
    // Send the message
    dispatch(sendMessage(messageData))
      .unwrap()
      .then((result) => {
        console.log('Reply sent successfully:', result);
        setLoading(false);
        setIsReplying(false);
        
        // No need to refresh the thread immediately - the optimistic update
        // in the messageSlice will show the message right away
        
        // Schedule a background refresh after a short delay to ensure
        // we have the latest data from the server
        setTimeout(() => {
          if (threadId) {
            dispatch(fetchMessageThread(threadId));
          }
        }, 2000);
        
        // Call the success handler if provided
        if (typeof handleReplySent === 'function') {
          handleReplySent();
        }
      })
      .catch((error) => {
        console.error('Error sending reply:', error);
        setLoading(false);
        
        // Show a user-friendly error message
        const errorMessage = error.message || 'Failed to send reply';
        setError(errorMessage);
        
        // The message will be shown in the UI as failed
        // thanks to the optimistic update in the messageSlice
      });
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
                    try {
                      e.stopPropagation();
                      if (window.confirm('Hide this message?')) {
                        dispatch(hideMessage(threadRootMessage._id)).unwrap()
                          .then(() => {
                            onClose && onClose(); // Close thread after hiding root message
                          })
                          .catch(error => {
                            console.error('Failed to hide message:', error);
                            // Optionally show error to user
                          });
                      }
                    } catch (error) {
                      console.error('Error hiding message:', error);
                    }
                  }}
                  isRoot={true}
                  isReply={false}
                  content={formatContent(threadRootMessage.content)}
                />
              </div>
            )}
            
            {/* Replies section */}
            {sortedReplies.length > 0 && (
              <div className="replies-section">
                <div className="replies-divider">
                  <span>{sortedReplies.length} {sortedReplies.length === 1 ? 'Reply' : 'Replies'}</span>
                </div>
                
                {sortedReplies.map(message => {
                  // Skip rendering if message is invalid
                  if (!message || !message._id) return null;
                  
                  return (
                    <MessageItem
                      key={message._id}
                      message={message}
                      onReply={handleReply}
                      onDelete={(e) => {
                        try {
                          e.stopPropagation();
                          if (window.confirm('Hide this message?')) {
                            dispatch(hideMessage(message._id)).unwrap()
                              .catch(error => {
                                console.error('Failed to hide message:', error);
                                // Optionally show error to user
                              });
                          }
                        } catch (error) {
                          console.error('Error hiding message:', error);
                        }
                      }}
                      isRoot={false}
                      isReply={true}
                      isPending={message.pending}
                      hasFailed={message.sendFailed}
                      content={formatContent(message.content)}
                    />
                  );
                })}
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
