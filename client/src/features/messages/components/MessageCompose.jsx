import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../store/authSlice';
import { selectMessageById } from '../store/messageSlice';
import { useMessageCompose } from '../hooks/useMessageCompose';
import RecipientSelector from './RecipientSelector';
import './MessageStyles.css';

const MessageCompose = ({ onCancel, mapCenter, parentMessageId, onSuccess }) => {
  const parentMessage = useSelector(parentMessageId ? state => selectMessageById(state, parentMessageId) : () => null);

  const [recipientId, setRecipientId] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [localError, setLocalError] = useState('');

  const {
    isSending,
    sendError,
    sendSuccess,
    sendMessage,
    resetSuccessState,
  } = useMessageCompose();

  const messageInputRef = useRef(null);

  useEffect(() => {
    if (parentMessage) {
      setRecipientId(parentMessage.senderId || '');
      setRecipientName(parentMessage.senderName || '');
    }
  }, [parentMessage]);

  useEffect(() => {
    if (recipientId && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [recipientId]);

  const handleSelectRecipient = (user) => {
    setRecipientId(user._id);
    setRecipientName(user.username || user.name || user.email);
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!message.trim()) {
      setLocalError('Please enter a message');
      return;
    }

    if (!recipientId) {
      setLocalError('Please select a recipient');
      return;
    }

    const messageData = {
      content: message,
      recipientId: recipientId,
      parentMessageId: parentMessageId || null,
      location: mapCenter || {
        type: 'Point',
        coordinates: [-118.243683, 34.052235]
      },
      radius: 1000
    };

    try {
      await sendMessage(messageData);

      setMessage('');
      if (!parentMessageId) {
        setRecipientId('');
        setRecipientName('');
      }

      setTimeout(() => {
        resetSuccessState();
        if (onSuccess) {
          onSuccess();
        } else if (onCancel) {
          onCancel();
        }
      }, 1500);

    } catch (err) {
      console.error('MessageCompose: Submit failed', err);
    }
  };

  return (
    <div className="compose-form card mb-md">
      <div className="card-header">
        <h4 className="m-0">
          {parentMessageId ? (
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
          disabled={isSending}
        >
          <span className="icon-close">×</span>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {parentMessage && parentMessageId && (
          <div className="reply-to-message">
            <div className="reply-indicator">
              <span className="icon">↩</span> Replying to:
            </div>
            <div className="original-message">
              <p className="message-content">{parentMessage.content}</p>
            </div>
          </div>
        )}

        {!parentMessageId && <RecipientSelector onSelectRecipient={handleSelectRecipient} />} 

        {recipientId && (
          <div className="selected-recipient">
            <span className="recipient-label">To:</span>
            <span className="recipient-value">{recipientName}</span>
          </div>
        )}

        {(localError || sendError) && <div className="error-message">{localError || sendError}</div>}
        {sendSuccess && <div className="success-message">Message sent successfully!</div>}

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
            disabled={isSending}
            required
          />
        </div>

        <div className="text-secondary mt-xs text-sm location-info">
          <small>
            <span className="mr-xs">📍</span>
            {mapCenter ?
              'Your current location will be attached to this message' :
              'Using default location for this message'}
          </small>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={onCancel}
            disabled={isSending}
          >
            <span className="icon mr-xs">✕</span> Cancel
          </button>
          <button
            type="submit"
            className="btn btn-sm btn-primary ml-xs"
            disabled={isSending || !message.trim() || !recipientId}
          >
            {isSending ? (
              <>
                <span className="icon spin mr-xs">⟳</span> Sending...
              </>
            ) : (
              <>
                <span className="icon mr-xs">✓</span> Send Message
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageCompose;
