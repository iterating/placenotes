import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectMessages } from '../../../store/messageSlice';
import { sendMessage, markMessageAsRead } from '../../../store/messageStoreAction';
import './MessageList.css';

const MessageList = ({ isOpen, onClose, mapCenter }) => {
  const dispatch = useDispatch();
  const messages = useSelector(selectMessages);
  const [newMessage, setNewMessage] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [error, setError] = useState('');
  const [radius, setRadius] = useState(1000);

  const handleSend = useCallback(async (e) => {
    e.preventDefault();
    setError('');

    if (!newMessage.trim() || !recipientId) {
      setError('Please enter a message and recipient');
      return;
    }

    try {
      await dispatch(sendMessage({
        recipientId,
        content: newMessage,
        location: {
          type: 'Point',
          coordinates: mapCenter ? [mapCenter.lng, mapCenter.lat] : [-118.243683, 34.052235]
        },
        radius
      })).unwrap();
      
      setNewMessage('');
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to send message');
    }
  }, [dispatch, newMessage, recipientId, mapCenter, radius]);

  const handleMessageClick = useCallback((messageId) => {
    dispatch(markMessageAsRead(messageId));
  }, [dispatch]);

  // Memoize sorted messages
  const sortedMessages = useMemo(() => 
    [...messages].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  , [messages]);

  return (
    <div className={`message-drawer ${isOpen ? 'open' : ''}`}>
      <div className="message-drawer-header">
        <h2>Messages</h2>
        <button className="close-button" onClick={onClose}>&times;</button>
      </div>

      <div className="message-form">
        <form onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Recipient ID"
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
            className="recipient-input"
          />
          <textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="message-input"
          />
          <div className="radius-input-container">
            <label htmlFor="radius">Radius (meters):</label>
            <input
              type="number"
              id="radius"
              value={radius}
              onChange={(e) => setRadius(Math.max(100, parseInt(e.target.value) || 1000))}
              min="100"
              className="radius-input"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="send-button">Send</button>
        </form>
      </div>

      <div className="messages-list">
        {sortedMessages.map((message) => (
          <div 
            key={message._id}
            onClick={() => handleMessageClick(message._id)}
            className={`message-item ${message.read ? 'read' : 'unread'}`}
          >
            <div className="message-header">
              <span className="message-sender">
                From: {message.senderId === recipientId ? 'You' : message.senderEmail}
              </span>
              <span className="message-time">
                {new Date(message.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="message-content">{message.content}</div>
            <div className="message-location">
              Location: {message.location.coordinates.join(', ')}
              <br />
              Radius: {message.radius}m
            </div>
          </div>
        ))}
        {sortedMessages.length === 0 && (
          <div className="no-messages">
            No messages in this area
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageList;
