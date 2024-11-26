import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
BASE_URL= 'http://localhost:5000';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Login: Handling submit');

    if (!email) {
      console.log('Login: No email provided');
      alert('Please enter your email address');
      return;
    }

    if (!password) {
      console.log('Login: No password provided');
      alert('Please enter your password');
      return;
    }

    try {
      const response = await axios.post('${BASE_URL}/users/login', {
        email,
        password,
      });

      console.log('Login: Response from server:', response.data);

      if (response.data && response.data.token) {
        console.log('Login: Success');
        sessionStorage.token = response.data.token;
        location.href = '/notes';
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert(error.response?.data?.message || 'An error occurred, please try again.');
    }
  };

  return (
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
  );
};

export default Login;

