import React, { useState, useRef, useEffect } from 'react';
import { searchUsers, sendFriendRequest } from '../../api/userService';
import './UserSearch.css';

const UserSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const handleSearch = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { success, users } = await searchUsers(query);
      if (success) {
        setSearchResults(users);
      }
    } catch (err) {
      setError('Error searching users');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      setError('');
      const { success, message } = await sendFriendRequest(userId);
      
      if (success) {
        // Update the user's status in search results
        setSearchResults(prevResults =>
          prevResults.map(user =>
            user._id === userId
              ? { ...user, hasPendingRequest: true }
              : user
          )
        );
      } else {
        setError(message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending friend request');
    }
  };

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        handleSearch(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="user-search" ref={searchRef}>
      <div className="search-input-container">
        <input
          type="email"
          placeholder="Search users by email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowResults(true)}
          className="user-search-input"
        />
      </div>

      {showResults && (searchTerm || isLoading) && (
        <div className="user-search-results">
          {isLoading ? (
            <div className="search-loading">Searching...</div>
          ) : error ? (
            <div className="search-error">{error}</div>
          ) : searchResults.length > 0 ? (
            <ul className="user-results-list">
              {searchResults.map(user => (
                <li key={user._id} className="user-result-item">
                  <div className="user-info">
                    <span className="user-name">{user.name || 'Unnamed User'}</span>
                    <span className="user-email">{user.email}</span>
                  </div>
                  <div className="user-actions">
                    {user.isFriend ? (
                      <span className="friend-badge">Friend</span>
                    ) : user.hasPendingRequest ? (
                      <span className="pending-badge">Request Sent</span>
                    ) : (
                      <button
                        onClick={() => handleSendRequest(user._id)}
                        className="send-request-btn"
                      >
                        Add Friend
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : searchTerm.length >= 2 ? (
            <div className="no-results">No users found</div>
          ) : (
            <div className="search-hint">Type at least 2 characters to search</div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearch;
