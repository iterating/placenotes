import React from 'react';
import { useSelector } from 'react-redux';
import './MessageList.css';

const MessageList = ({ isOpen }) => {
  const messages = [
    {
      id: 1,
      sender: 'Lilly',
      avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=Lilly',
      text: 'Hey, I found some interesting places near the park!',
      time: '10:30 AM',
      unread: true
    },
    {
      id: 2,
      sender: 'Jan',
      avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=Jan',
      text: 'Check out this new coffee shop I discovered.',
      time: '9:15 AM',
      unread: false
    },
    {
      id: 3,
      sender: 'May',
      avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=May',
      text: 'The museum exhibition was amazing!',
      time: 'Yesterday',
      unread: true
    },
    {
      id: 4,
      sender: 'Jack',
      avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=Jack',
      text: 'Let\'s meet at the new restaurant downtown.',
      time: 'Yesterday',
      unread: false
    }
  ];

  return (
    <div className={`message-list ${isOpen ? 'open' : ''}`}>
      <div className="message-list-header">
        <h2>Messages</h2>
      </div>
      <div className="message-list-content">
        {messages.map((message) => (
          <div key={message.id} className={`message-item ${message.unread ? 'unread' : ''}`}>
            <div className="message-avatar">
              <img src={message.avatar} alt={`${message.sender}'s avatar`} />
              {message.unread && <span className="unread-indicator" />}
            </div>
            <div className="message-content">
              <div className="message-header">
                <span className="sender-name">{message.sender}</span>
                <span className="message-time">{message.time}</span>
              </div>
              <p className="message-text">{message.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessageList;
