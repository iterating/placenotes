import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// API base URL - will work both in development and production
const BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://placenotes.onrender.com'
  : 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/users/signup', {
        email: formData.email,
        password: formData.password,
        username: formData.username
      });
      
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        navigate('/notes');
      } else {
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Signup error:', error);
      if (error.response) {
        setError(error.response.data?.message || 'Signup failed');
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
      <h1 className="title">Sign Up</h1>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={loading}
          required
        />
        
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          disabled={loading}
          required
        />
        
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          disabled={loading}
          required
        />
        
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={loading}
          required
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
      <p>
        Already have an account? <a href="/users/login">Login</a>
      </p>
    </div>
  );
};

export default Signup;
