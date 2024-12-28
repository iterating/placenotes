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
    'Content-Type': 'application/json'
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await api.post('/users/signup', {
        email: formData.email,
        password: formData.password,
        username: formData.username
      });

      console.log('Signup successful:', response.data);
      
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        navigate('/notes');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.response?.data?.message || 'An error occurred during signup');
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
          required
        />
        
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        
        <button type="submit">Sign Up</button>
      </form>
      <p>
        Already have an account? <a href="/users/login">Login</a>
      </p>
    </div>
  );
};

export default Signup;
