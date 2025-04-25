import React, { useState } from 'react';
import { useFriendsList } from '../../friends/hooks/useFriendsList';
import './MessageStyles.css';

const RecipientSelector = ({ onSelectRecipient }) => {
  const { friends, isLoading, error, refetchFriends } = useFriendsList();
  
  const [selectedFriendId, setSelectedFriendId] = useState('');
  
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
          disabled={isLoading}
        >
          <option value="">-- Select a friend --</option>
          {friends.map(friend => (
            <option key={friend._id} value={friend._id}>
              {friend.name || friend.username || friend.email}
            </option>
          ))}
        </select>
      </div>
      
      {isLoading && (
        <div className="search-loading">Loading friends...</div>
      )}
      
      {error && (
        <div className="search-error text-danger">{error}</div>
      )}
      
      {!isLoading && friends.length === 0 && (
        <div className="empty-state">
          <p>You don't have any friends in your contacts list.</p>
        </div>
      )}
    </div>
  );
};

export default RecipientSelector;
