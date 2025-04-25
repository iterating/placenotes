import React from 'react';
import { useMessageList } from '../hooks/useMessageList';
import MessageItem from './MessageItem';
import MessageCompose from './MessageCompose';
import MessageThread from './MessageThread';
import HiddenMessages from './HiddenMessages';
import './MessageStyles.css';

const MessageList = ({ isOpen, onClose, mapCenter }) => {
  const {
    messages,
    hiddenMessages,
    loading,
    refreshing,
    error,
    selectedMessageId,
    currentUser,
    pagination,
    isComposing,
    showingThread,
    showingHiddenMessages,
    selectMessage,
    hideMessage,
    openCompose,
    closeCompose,
    closeThread,
    loadMoreMessages,
    viewHiddenMessages,
    closeHiddenMessages,
    retryFetch
  } = useMessageList(isOpen, mapCenter);

  const renderMessages = () => {
    if (loading && !refreshing && messages.length === 0) {
      return renderLoading();
    }

    if (!loading && error) {
      return renderError();
    }

    if (!loading && messages.length === 0) {
      return (
        <div className="empty-state flex-col flex-center">
          <p>No messages found in this area.</p>
          <div className="flex-col gap-sm">
            <button
              className="btn btn-primary"
              onClick={openCompose}
            >
              Compose Message
            </button>

            {hiddenMessages.length > 0 && (
              <button
                className="btn btn-outline-secondary"
                onClick={viewHiddenMessages}
              >
                View Hidden Messages ({hiddenMessages.length})
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div>
        {refreshing && <div className="loading-indicator small">Refreshing...</div>}

        {messages.map(message => (
          <div
            key={message._id}
            onClick={() => selectMessage(message)}
            className={`message-item-wrapper ${message._id === selectedMessageId ? 'selected' : ''} ${message.read ? '' : 'unread'}`}
            role="button"
            tabIndex={0}
            aria-label={`Message from ${message.senderName || 'Unknown'}`}
          >
            <MessageItem
              message={message}
              onReply={() => selectMessage(message)}
              onDelete={hideMessage}
            />
          </div>
        ))}
        {pagination && pagination.currentPage < pagination.totalPages && !refreshing && (
          <div className="load-more">
            <button
              className="btn btn-outline-primary"
              onClick={loadMoreMessages}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderHeader = () => {
    let title = 'Messages';
    if (showingThread) title = 'Message Thread';
    else if (isComposing) title = 'New Message';
    else if (showingHiddenMessages) title = 'Hidden Messages';

    return (
      <div className="messages-header">
        <h2 className="messages-title">{title}</h2>
        <button
          className="close-button"
          onClick={onClose}
          aria-label="Close messages"
        >
          <span className="icon">×</span>
        </button>
      </div>
    );
  };

  const renderComposeForm = () => {
    return (
      <MessageCompose
        onCancel={closeCompose}
        onSuccess={closeCompose}
        mapCenter={mapCenter}
      />
    );
  };

  const renderLoading = () => (
    <div className="loading-state flex-col flex-center">
      <div className="loading-spinner"></div>
      <p className="text-secondary">Loading messages...</p>
    </div>
  );

  const renderError = () => (
    <div className="error-state flex-col flex-center">
      <div className="error-icon">⚠️</div>
      <h3>Error</h3>
      <p className="text-secondary">{error?.message || 'Failed to load messages'}</p>
      <button
        onClick={retryFetch}
        className="btn btn-primary mt-sm"
      >
        Try Again
      </button>
    </div>
  );

  if (!isOpen) return null;

  let content;
  if (isComposing) {
    content = (
      <div key="compose-form">
        {renderComposeForm()}
      </div>
    );
  } else if (showingThread && selectedMessageId) {
    content = (
      <div key="message-thread">
        <MessageThread
          threadId={selectedMessageId}
          onClose={closeThread}
        />
      </div>
    );
  } else if (showingHiddenMessages) {
    content = (
      <div key="hidden-messages">
        <div className="messages-header">
          <button className="back-button" onClick={closeHiddenMessages} aria-label="Back to messages">
            <span className="icon">←</span>
          </button>
          <h2 className="messages-title">Hidden Messages</h2>
          <button className="close-button" onClick={onClose} aria-label="Close panel">×</button>
        </div>
        <HiddenMessages />
      </div>
    );
  } else {
    content = (
      <div key="messages-container" className="messages-container">
        <div className="messages-actions">
          <button
            className="btn btn-primary"
            onClick={openCompose}
          >
            Compose Message
          </button>
          {hiddenMessages.length > 0 && (
            <button
              className="btn btn-outline-secondary"
              onClick={viewHiddenMessages}
            >
              View Hidden ({hiddenMessages.length})
            </button>
          )}
        </div>
        {renderMessages()}
      </div>
    );
  }

  return (
    <div className={`drawer-base drawer-right ${isOpen ? 'open' : ''}`}>
      {renderHeader()}
      <div className="drawer-content">
        {content}
      </div>
    </div>
  );
};

export default MessageList;
