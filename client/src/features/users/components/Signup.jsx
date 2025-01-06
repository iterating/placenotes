import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../../store/authSlice';
import axios from 'axios';
import { SERVER } from '../../../app/config';
import { Link } from 'react-router-dom';
import './Signup.css';

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
        location: {
          type: 'Point',
          coordinates: currentLocation.coordinates
        }
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
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h1>Create Account</h1>
          <p className="subtitle">Join PlaceNotes to start your journey</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="signup-email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="Enter your email"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="signup-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              placeholder="Choose a password"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="currentLocation">Your City</label>
            <select
              id="signup-currentLocation"
              value={`${currentLocation.coordinates[0]},${currentLocation.coordinates[1]}`}
              onChange={(event) => setLocation({
                type: 'Point',
                coordinates: event.target.value.split(',').map(x => parseFloat(x))
              })}
              className="form-select"
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
            </select>
          </div>

          <button type="submit" className="signup-button">
            Create Account
          </button>

          <div className="form-footer">
            <p>
              Already have an account?{' '}
              <Link to="/users/login" className="login-link">
                Log in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
