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

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    console.log('Login: Handling submit');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    try {
      const response = await api.post('/users/login', {
        email,
        password,
      });

      console.log('Login: Response from server:', response.data);

      if (response.data && response.data.token) {
        console.log('Login: Success');
        localStorage.setItem('token', response.data.token);
        navigate('/notes');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setError(error.response?.data?.message || 'An error occurred, please try again.');
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
          required
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <a href="/users/register">Register</a>
      </p>
    </div>
  );
};

export default Login;
