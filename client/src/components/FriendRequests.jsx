import React, { useState } from 'react';
import { apiClient } from '../api/apiClient';
// Using shared CSS classes instead of component-specific CSS

const FriendRequests = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSendRequest = async (e) => {
    e.preventDefault();
    try {
      setMessage('');
      setError('');
      
      const response = await apiClient.post('/friends/request', { email });
      setMessage(response.data.message);
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending friend request');
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSendRequest} className="form-container">
        <div className="form-group">
          <label htmlFor="friend-email" className="form-label">Friend's Email</label>
          <input
            id="friend-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter friend's email"
            required
            className="form-input"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Send Friend Request
        </button>
      </form>
      
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default FriendRequests;
