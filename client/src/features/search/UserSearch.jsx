import React, { useState, useRef, useEffect } from 'react';
import { apiClient } from '../../api/apiClient';

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
      const response = await apiClient.get(`/users/search?email=${encodeURIComponent(query)}`);
      if (response.data.success) {
        setSearchResults(response.data.users);
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
      const response = await apiClient.post('/users/friend-request', {
        targetUserId: userId
      });
      
      if (response.data.success) {
        // Update the user's status in search results
        setSearchResults(prevResults =>
          prevResults.map(user =>
            user._id === userId
              ? { ...user, hasPendingRequest: true }
              : user
          )
        );
      } else {
        setError(response.data.message);
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
    <div className="search-wrapper position-relative" ref={searchRef}>
      <div className="input-group">
        <input
          type="email"
          placeholder="Search users by email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowResults(true)}
          className="form-input"
        />
      </div>

      {showResults && (searchTerm || isLoading) && (
        <div className="dropdown-menu show position-absolute w-100">
          {isLoading ? (
            <div className="dropdown-item text-center">Searching...</div>
          ) : error ? (
            <div className="dropdown-item text-danger">{error}</div>
          ) : searchResults.length > 0 ? (
            <ul className="list-unstyled m-0">
              {searchResults.map(user => (
                <li key={user._id} className="dropdown-item d-flex justify-content-between align-items-center p-2">
                  <div className="flex-grow-1">
                    <div className="font-weight-bold">{user.name || 'Unnamed User'}</div>
                    <div className="text-secondary small">{user.email}</div>
                  </div>
                  <div>
                    {user.isFriend ? (
                      <span className="badge badge-success">Friend</span>
                    ) : user.hasPendingRequest ? (
                      <span className="badge badge-secondary">Request Sent</span>
                    ) : (
                      <button
                        onClick={() => handleSendRequest(user._id)}
                        className="btn btn-sm btn-outline-primary"
                      >
                        Add Friend
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : searchTerm.length >= 2 ? (
            <div className="dropdown-item text-center text-muted">No users found</div>
          ) : (
            <div className="dropdown-item text-center text-muted">Type at least 2 characters to search</div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearch;
