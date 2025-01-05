import React, { useState } from 'react';
import axios from 'axios';
import './FriendRequests.css';

const FriendRequests = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSendRequest = async (e) => {
    e.preventDefault();
    try {
      setMessage('');
      setError('');
      
      const response = await axios.post('/api/friends/request', { email });
      setMessage(response.data.message);
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending friend request');
    }
  };

  return (
    <div className="friend-requests">
      <form onSubmit={handleSendRequest} className="friend-request-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter friend's email"
          required
          className="friend-email-input"
        />
        <button type="submit" className="send-request-btn">
          Send Friend Request
        </button>
      </form>
      
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default FriendRequests;
