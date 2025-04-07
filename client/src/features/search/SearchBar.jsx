import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.get(`/users/search?email=${encodeURIComponent(query)}`);
      if (response.data.success) {
        setSearchResults(response.data.users);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setShowResults(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.includes('@')) {
      searchUsers(value);
    } else {
      setSearchResults([]);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      const response = await apiClient.post('/users/friend-request', {
        targetUserId: userId
      });
      
      if (response.data.success) {
        setSearchResults(results =>
          results.map(user =>
            user._id === userId
              ? { ...user, hasPendingRequest: true }
              : user
          )
        );
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

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
      <div className="input-with-icon">
        <span className="input-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setShowResults(true)}
          className="form-input"
          placeholder="Search notes or type @ to find users..."
          aria-label="Search"
        />
      </div>

      <button type="submit" className="btn btn-icon" aria-label="Submit search" onClick={handleSearch}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </button>

      {showResults && searchTerm.includes('@') && (
        <div className="dropdown-menu show position-absolute w-100">
          {isLoading ? (
            <div className="dropdown-item text-center">Searching users...</div>
          ) : searchResults.length > 0 ? (
            <div className="dropdown-list">
              {searchResults.map(user => (
                <div key={user._id} className="dropdown-item d-flex justify-content-between align-items-center p-2">
                  <span>{user.email}</span>
                  {!user.isFriend && !user.hasPendingRequest && (
                    <button
                      onClick={() => handleSendRequest(user._id)}
                      className="btn btn-sm btn-outline-primary"
                    >
                      Add Friend
                    </button>
                  )}
                  {user.hasPendingRequest && (
                    <button
                      disabled
                      className="btn btn-sm btn-secondary"
                    >
                      Request Sent
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : searchTerm.includes('@') && searchTerm.length > 2 && (
            <div className="dropdown-item text-center text-muted">No users found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
