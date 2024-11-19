import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = (props) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/users/login', {
        email,
        password,
      });

      if (response.data.success) {
        // Destroy the existing token and create a new one
        localStorage.removeItem('authToken');
        localStorage.setItem('authToken', response.data.token);
        navigate('/notes');
      } else {
        alert('Invalid email or password');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      if (error.response && error.response.data) {
        alert(error.response.data.message);
      } else {
        alert('An unexpected error occurred');
      }
    }
  };

  return (
    <>
      <div id="form" className="form">
        <h1 className="title">Login</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          /><br />
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          /><br />
          <input type="submit" value="Submit" />
          <a href="/users/signup">Sign Up For Account</a>
        </form>
      </div>
    </>
  );
};

export default Login;

