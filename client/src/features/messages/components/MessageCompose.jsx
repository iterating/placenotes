import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '../../../api/apiClient';

const MessageCompose = () => {
  const [recipientId, setRecipientId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [message, setMessage] = useState('');
  const [coords, setCoords] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Parse recipientId from query parameters
    const params = new URLSearchParams(location.search);
    const id = params.get('recipient');
    
    if (id) {
      setRecipientId(id);
      // Get current user location for the message
      getCurrentLocation();
    } else {
      setError('No recipient specified');
    }
  }, [location]);
  
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords([position.coords.longitude, position.coords.latitude]);
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('Could not get your location. Your message will not have location data.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }
    
    if (!recipientId) {
      setError('Recipient information is missing');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Prepare message data
      const messageData = {
        content: message,
        recipientId: recipientId,
        location: coords ? {
          type: 'Point',
          coordinates: coords
        } : {
          // Default location if user doesn't provide one
          type: 'Point',
          coordinates: [-118.243683, 34.052235] // Default coordinates (Los Angeles)
        },
        radius: 1000 // Default radius in meters
      };
      
      console.log('Sending message data:', JSON.stringify(messageData, null, 2));
      console.log('RecipientId type:', typeof recipientId);
      
      // Send the message with more detailed error handling
      try {
        console.log('Sending to endpoint:', '/messages/create');
        const response = await apiClient.post('/messages/create', messageData);
        console.log('Message creation response:', response.data);
        
        setSuccess('Message sent successfully!');
        setMessage('');
        
        // Wait a moment to show success message before navigating away
        setTimeout(() => {
          navigate('/friends');
        }, 1500);
      } catch (networkErr) {
        console.error('Network error details:', networkErr);
        
        if (networkErr.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Server response error:', {
            data: networkErr.response.data,
            status: networkErr.response.status,
            headers: networkErr.response.headers
          });
          
          setError(`Server error: ${networkErr.response.data?.message || networkErr.response.statusText}`);
        } else if (networkErr.request) {
          // The request was made but no response was received
          console.error('No response received:', networkErr.request);
          setError('No response from server. Please check your connection.');
        } else {
          // Something happened in setting up the request that triggered an error
          console.error('Request setup error:', networkErr.message);
          setError(`Request error: ${networkErr.message}`);
        }
        throw networkErr; // re-throw to be caught by outer catch
      }
    } catch (err) {
      console.error('Error in message submission process:', err);
      setError('Failed to send message. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="drawer-base drawer-right open">
      <div className="drawer-header">
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/friends')}
        >
          ← Back to Friends
        </button>
        <h2>New Message</h2>
      </div>
      
      <div className="drawer-content">
        <div className="card">
          <div className="avatar-placeholder">
            F
          </div>
          <div className="flex-col">
            <h3 className="m-0">Friend</h3>
            <p className="text-secondary">Sending to friend ID: {recipientId?.substring(0, 8)}...</p>
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label htmlFor="message-input" className="form-label">Message</label>
          <textarea
            id="message-input"
            className="form-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            rows={6}
            required
            disabled={loading}
          />
        </div>
        
        {coords ? (
          <div className="location-info">
            <span className="location-icon">📍</span>
            Your current location will be attached to this message
          </div>
        ) : (
          <div className="location-info">
            <span className="location-icon">📍</span>
            Using default location for this message
          </div>
        )}
        
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading || !message.trim() || !recipientId}
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
      </div>
    </div>
  );
};

export default MessageCompose;
