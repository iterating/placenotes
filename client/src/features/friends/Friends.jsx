import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { apiClient } from '../../api/apiClient';
import { selectIsAuthenticated } from '../../store/authSlice';
// Using shared CSS classes instead of component-specific CSS

const Friends = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('friends');
  
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Fetch friend requests and friends list on component mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchFriendRequests();
      fetchFriends();
    }
  }, [isAuthenticated]);

  // Search for users
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await apiClient.get(`/friends/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data);
    } catch (err) {
      console.error('Error searching users:', err);
      setError(err.response?.data?.message || 'Error searching for users');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch pending friend requests
  const fetchFriendRequests = async () => {
    try {
      console.log('Auth status:', isAuthenticated);
      console.log('Making request to /friends/pending');
      const response = await apiClient.get('/friends/pending');
      setFriendRequests(response.data);
    } catch (err) {
      console.error('Error fetching friend requests:', err);
      // Log more details about the error
      console.log('Error status:', err.response?.status);
      console.log('Error data:', err.response?.data);
    }
  };

  // Fetch friends list
  const fetchFriends = async () => {
    try {
      const response = await apiClient.get('/friends/list');
      setFriends(response.data);
    } catch (err) {
      console.error('Error fetching friends:', err);
    }
  };

  // Send friend request
  const sendFriendRequest = async (email) => {
    setError('');
    setSuccess('');
    
    try {
      const response = await apiClient.post('/friends/request', { email });
      setSuccess(response.data.message);
      
      // Update the search results to reflect the sent request
      setSearchResults(prevResults => 
        prevResults.map(user => 
          user.email === email 
            ? { ...user, hasPendingRequest: true } 
            : user
        )
      );
    } catch (err) {
      console.error('Error sending friend request:', err);
      setError(err.response?.data?.message || 'Error sending friend request');
    }
  };

  // Respond to friend request (accept or reject)
  const respondToRequest = async (requestId, action) => {
    try {
      await apiClient.post('/friends/respond', { requestId, action });
      
      // Refresh lists after responding
      fetchFriendRequests();
      fetchFriends();

      setSuccess(`Friend request ${action === 'accept' ? 'accepted' : 'rejected'}`);
    } catch (err) {
      console.error(`Error ${action}ing friend request:`, err);
      setError(err.response?.data?.message || `Error ${action}ing friend request`);
    }
  };

  // Start a new message to a friend
  const startMessage = (friendId) => {
    navigate(`/messages/compose?recipient=${friendId}`);
  };

  return (
    <div className="container">
      <h1 className="text-center mb-md">Friends</h1>
      
      {/* Tab navigation */}
      <div className="flex flex-center mb-md">
        <button 
          className={`btn ${activeTab === 'friends' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('friends')}
        >
          My Friends
        </button>
        <button 
          className={`btn ${activeTab === 'requests' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('requests')}
          style={{position: 'relative'}}
        >
          Friend Requests 
          {friendRequests.length > 0 && <span style={{position: 'absolute', top: '-5px', right: '-5px', background: 'var(--danger-color)', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem'}}>{friendRequests.length}</span>}
        </button>
        <button 
          className={`btn ${activeTab === 'search' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('search')}
        >
          Find Friends
        </button>
      </div>
      
      {/* Success and error messages */}
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}
      
      {/* Friends list tab */}
      {activeTab === 'friends' && (
        <div className="mb-md">
          {friends.length === 0 ? (
            <div className="empty-state flex-col flex-center">
              <p className="text-secondary">You don't have any friends yet. Send a friend request to get started!</p>
            </div>
          ) : (
            <div className="flex-col gap-md">
              {friends.map(friend => (
                <div key={friend._id} className="card flex-between items-center">
                  <div className="flex-col">
                    <h3 className="m-0">{friend.name}</h3>
                    <p className="text-secondary">{friend.email}</p>
                  </div>
                  <div>
                    <button 
                      className="btn btn-primary"
                      onClick={() => startMessage(friend._id)}
                    >
                      Send Message
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Friend requests tab */}
      {activeTab === 'requests' && (
        <div className="mb-md">
          {friendRequests.length === 0 ? (
            <div className="empty-state flex-col flex-center">
              <p className="text-secondary">You don't have any pending friend requests.</p>
            </div>
          ) : (
            <div className="flex-col gap-md">
              {friendRequests.map(request => (
                <div key={request._id} className="card flex-between items-center">
                  <div className="flex-col">
                    <h3 className="m-0">{request.from.name}</h3>
                    <p className="text-secondary">{request.from.email}</p>
                  </div>
                  <div className="flex gap-sm">
                    <button 
                      className="btn btn-primary"
                      onClick={() => respondToRequest(request._id, 'accept')}
                    >
                      Accept
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => respondToRequest(request._id, 'reject')}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Search tab */}
      {activeTab === 'search' && (
        <div className="mb-md">
          <form onSubmit={handleSearch} className="flex gap-sm mb-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by email or name"
              required
              className="form-input"
              style={{flex: 1}}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </form>
          
          {searchResults.length > 0 && (
            <div className="flex-col gap-md">
              {searchResults.map(user => (
                <div key={user._id} className="card flex-between items-center">
                  <div className="flex-col">
                    <h3 className="m-0">{user.name}</h3>
                    <p className="text-secondary">{user.email}</p>
                  </div>
                  <div>
                    {user.isFriend ? (
                      <button 
                        className="btn btn-primary"
                        onClick={() => startMessage(user._id)}
                      >
                        Send Message
                      </button>
                    ) : user.hasPendingRequest ? (
                      <span className="text-secondary font-medium">Request Sent</span>
                    ) : (
                      <button 
                        className="btn btn-outline-primary"
                        onClick={() => sendFriendRequest(user.email)}
                      >
                        Add Friend
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {searchQuery && searchResults.length === 0 && !isLoading && (
            <div className="empty-state flex-col flex-center">
              <p className="text-secondary">No users found. Try a different search term.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Friends;
