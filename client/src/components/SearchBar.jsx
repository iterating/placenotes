import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SearchBar.css';

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
      const response = await axios.get(`/api/users/search?email=${encodeURIComponent(query)}`);
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
      const response = await axios.post('/api/users/friend-request', {
        targetUserId: userId
      });
      
      if (response.data.success) {
        // Update the user's status in search results
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
    <div className="search-container" ref={searchRef}>
      <form onSubmit={handleSearch} className="search-bar">
        <input
          type="text"
          placeholder="Search notes or type @ to find users..."
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setShowResults(true)}
          className="form-input"
        />
        <button type="submit" className="btn btn-primary btn-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </form>

      {showResults && searchTerm.includes('@') && (
        <div className="search-results">
          {isLoading ? (
            <div className="search-loading">Searching users...</div>
          ) : searchResults.length > 0 ? (
            <div className="results-list">
              {searchResults.map(user => (
                <div key={user._id} className="search-result-item">
                  <span>{user.email}</span>
                  {!user.isFriend && !user.hasPendingRequest && (
                    <button
                      onClick={() => handleSendRequest(user._id)}
                      className="btn btn-outline-primary btn-sm"
                    >
                      Add Friend
                    </button>
                  )}
                  {user.hasPendingRequest && (
                    <button
                      disabled
                      className="btn btn-secondary btn-sm"
                    >
                      Request Sent
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : searchTerm.includes('@') && searchTerm.length > 2 && (
            <div className="no-results">No users found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;