import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PendingRequests.css';

const PendingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    try {
      const response = await axios.get('/api/friends/pending');
      setRequests(response.data);
    } catch (err) {
      setError('Error fetching friend requests');
    }
  };

  const handleResponse = async (requestId, action) => {
    try {
      await axios.post('/api/friends/respond', { requestId, action });
      // Remove the request from the list
      setRequests(requests.filter(req => req._id !== requestId));
    } catch (err) {
      setError('Error processing friend request');
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="pending-requests">
      <h3>Pending Friend Requests</h3>
      {requests.length === 0 ? (
        <p className="no-requests">No pending friend requests</p>
      ) : (
        <ul className="requests-list">
          {requests.map(request => (
            <li key={request._id} className="request-item">
              <div className="request-info">
                <span className="requester-name">{request.from.name}</span>
                <span className="requester-email">{request.from.email}</span>
              </div>
              <div className="request-actions">
                <button
                  onClick={() => handleResponse(request._id, 'accept')}
                  className="accept-btn"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleResponse(request._id, 'reject')}
                  className="reject-btn"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PendingRequests;
