import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// API base URL - will work both in development and production
const BASE_URL = import.meta.env.MODE === 'production' 
  ? '/api'  // In production, use relative path since frontend and backend are served from same origin
  : 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/users/login', {
        email,
        password
      });

      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        navigate('/notes');
      } else {
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      if (error.response) {
        setError(error.response.data?.message || 'Login failed');
      } else if (error.request) {
        setError('No response from server. Please try again later.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="form" className="form">
      <h1 className="title">Login</h1>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p>
        Don't have an account? <a href="/users/register">Register</a>
      </p>
    </div>
  );
};

export default Login;
