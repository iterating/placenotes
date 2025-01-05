import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../../store/authSlice';
import axios from 'axios';
import { SERVER } from '../../../app/config';

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [currentLocation, setLocation] = useState({
    type: 'Point',
    coordinates: [-118.243683, 34.052235]
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${SERVER}/users/signup`, {
        email,
        password,
        location: JSON.stringify(currentLocation),
      });

      if (response.data?.token) {
        dispatch(loginSuccess({
          token: response.data.token,
          user: response.data.user
        }));
        navigate('/notes');
      }
    } catch (error) {
      console.error('Error signing up:', error);
      setError(error.response?.data?.message || 'An error occurred during signup');
    }
  };

  return (
    <div id="form">
      <h1 className="title">Signup</h1>
      {error && <div className="error">{error}</div>}
      <form id="signup-form" onSubmit={handleSubmit}>
        <label htmlFor="email">Email:</label><br />
        <input
          type="email"
          id="signup-email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        /><br />
        <label htmlFor="password">Password:</label><br />
        <input
          type="password"
          id="signup-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        /><br />
        <label htmlFor="currentLocation">Location:</label><br />
        <select
          id="signup-currentLocation"
          value={`${currentLocation.coordinates[0]},${currentLocation.coordinates[1]}`}
          onChange={(event) => setLocation({
            type: 'Point',
            coordinates: event.target.value.split(',').map(x => parseFloat(x))
          })}
        >
          <option value="-118.243683,34.052235">New York</option>
          <option value="-118.243683,34.052235">Los Angeles</option>
          <option value="-87.629799,41.878114">Chicago</option>
          <option value="-95.369803,29.763285">Houston</option>
          <option value="-75.163079,39.952335">Philadelphia</option>
          <option value="-98.493628,29.424122">San Antonio</option>
          <option value="-117.161083,32.715736">San Diego</option>
          <option value="-96.796988,32.776665">Dallas</option>
          <option value="-121.894958,37.338208">San Jose</option>
        </select><br />
        <input type="submit" value="Create Account" />
        <a href="/users/login">Already have an account? Login</a>
      </form>
    </div>
  );
};

export default Signup;
