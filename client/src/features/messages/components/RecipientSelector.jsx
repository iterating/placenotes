import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { apiClient } from '../../../api/apiClient';
import './MessageStyles.css';

const RecipientSelector = ({ onSelectRecipient }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFriendId, setSelectedFriendId] = useState('');
  
  // Load friends list when component mounts
  useEffect(() => {
    fetchFriends();
  }, []);
  
  // Fetch user's friends
  const fetchFriends = async () => {
    try {
      setLoading(true);
      
      const response = await apiClient.get('/friends/list');
      setFriends(response.data || []);
    } catch (err) {
      console.error('Error fetching friends:', err);
      setError('Could not load friends list');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle dropdown selection change
  const handleSelectChange = (e) => {
    const friendId = e.target.value;
    setSelectedFriendId(friendId);
    
    if (friendId) {
      const selectedFriend = friends.find(friend => friend._id === friendId);
      if (selectedFriend) {
        onSelectRecipient(selectedFriend);
      }
    }
  };
  
  return (
    <div className="recipient-selector">
      <div className="form-group">
        <label htmlFor="friendsDropdown">Select Recipient:</label>
        <select
          id="friendsDropdown"
          className="form-control"
          value={selectedFriendId}
          onChange={handleSelectChange}
          disabled={loading}
        >
          <option value="">-- Select a friend --</option>
          {friends.map(friend => (
            <option key={friend._id} value={friend._id}>
              {friend.name || friend.username || friend.email}
            </option>
          ))}
        </select>
      </div>
      
      {loading && (
        <div className="search-loading">Loading friends...</div>
      )}
      
      {error && (
        <div className="search-error text-danger">{error}</div>
      )}
      
      {!loading && friends.length === 0 && (
        <div className="empty-state">
          <p>You don't have any friends in your contacts list.</p>
        </div>
      )}
    </div>
  );
};

export default RecipientSelector;
