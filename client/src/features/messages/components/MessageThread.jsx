import React, { useEffect, useRef } from 'react';
import { useMessageThread } from '../hooks/useMessageThread'; // Import the custom hook
import MessageItem from './MessageItem';
import MessageCompose from './MessageCompose';
import './MessageStyles.css';

/**
 * Simplified MessageThread component - displays a message thread and allows replies,
 * using the useMessageThread hook for logic.
 */
const MessageThread = ({ threadId, onClose }) => {
  // Use the custom hook to get state and actions
  const {
    rootMessage,
    replies, // Already sorted by the hook/selector
    messagesToDisplay, // Combined and sorted
    isLoading, // Loading state for the thread fetch
    error, // Error state for the thread fetch
    isReplying,
    sendError, // Error specifically for the send operation
    currentUser,
    openReplyBox,
    closeReplyBox,
    sendReply,
    hideSpecificMessage,
  } = useMessageThread(threadId);

  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages when they update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messagesToDisplay.length]); // Trigger scroll when the number of messages changes

  // Render the sender's name with fallbacks (could be moved to utils if used elsewhere)
  const renderSender = (message) => {
    if (!message) return 'Unknown';
    return message.senderName ||
           (message.sender && (message.sender.username || message.sender.name || message.sender.email)) ||
           'Unknown';
  };

  // Format message content with line breaks (could be moved to utils)
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
      console.warn("Failed to format message content:", err);
      return String(content); // Fallback to string conversion
    }
  };

  // Get the title for the message thread
  const getTitle = () => {
    if (rootMessage) {
      return `Message from ${renderSender(rootMessage)}`;
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
            <span className="icon">←</span> {/* Use a proper icon component later */}
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
          <span className="icon">←</span> {/* Use a proper icon component later */}
        </button>
      </div>

      <div className="thread-body">
        {/* Loading state */}
        {isLoading && !rootMessage && <div className="loading-indicator">Loading messages...</div>} {/* Show loading only if no data yet */}

        {/* Error state for thread fetch */}
        {error && (
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <div>
              <p>{error}</p>
              {/* Retry button could re-trigger the fetch via the hook if needed */}
              {/* <button onClick={retryFetch}>Try Again</button> */}
            </div>
          </div>
        )}

        {/* Messages */}
        {!isLoading && !error && messagesToDisplay.length > 0 ? (
          <div className="thread-messages">
            {/* Root message */}
            {rootMessage && (
              <div className="root-message-container">
                <MessageItem
                  key={rootMessage._id}
                  message={rootMessage}
                  onReply={openReplyBox} // Use handler from hook
                  onDelete={async (e) => {
                    try {
                      await hideSpecificMessage(rootMessage._id);
                      if (onClose) onClose();
                    } catch (err) {
                      console.error("Failed to hide root message:", err);
                    }
                  }}
                  isRoot={true}
                  isReply={false}
                />
              </div>
            )}

            {/* Replies section */}
            {replies.length > 0 && (
              <div className="replies-section">
                <div className="replies-divider">
                  <span>{replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}</span>
                </div>

                {replies.map(message => {
                  // Skip rendering if message is invalid
                  if (!message || !message._id) return null;

                  return (
                    <MessageItem
                      key={message._id}
                      message={message}
                      onReply={openReplyBox} // Use handler from hook
                      onDelete={hideSpecificMessage} // Direct handler for replies
                      isRoot={false}
                      isReply={true}
                      isPending={message.pending}
                      hasFailed={message.sendFailed}
                    />
                  );
                })}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : (!isLoading && !error) ? (
          <div className="empty-replies">No messages in this thread yet.</div>
        ) : null}

        {/* Reply form / Button */}
        {!error && ( // Don't show reply if the thread failed to load
          isReplying ? (
            <div className="reply-form">
              <MessageCompose
                parentMessage={rootMessage} // Pass root message context if needed
                onCancel={closeReplyBox} // Use handler from hook
                onSuccess={sendReply} // Use handler from hook directly
                isSending={isLoading} // Reflect send status if hook provides it
                sendError={sendError} // Show send error from hook
              />
            </div>
          ) : (
            rootMessage && ( // Only show reply button if root message exists
              <div className="quick-reply-button">
                <button className="btn btn-primary" onClick={openReplyBox}>
                  Reply
                </button>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
};

export default MessageThread;