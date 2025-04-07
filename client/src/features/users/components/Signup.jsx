import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../../store/authSlice';
import { apiClient } from '../../../api/apiClient';
import { Link } from 'react-router-dom';

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
      const response = await apiClient.post('/users/signup', {
        email,
        password,
        location: {
          type: 'Point',
          coordinates: currentLocation.coordinates
        }
      });

      if (response.data?.token) {
        dispatch(setCredentials({
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
    <div className="center-container">
      <div className="card form-container">
        <div className="text-center mb-md">
          <h1 className="m-0">Create Account</h1>
          <p className="text-secondary">Join PlaceNotes to start your journey</p>
        </div>

        {error && <div className="error-message mb-md">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="signup-email" className="form-label">Email</label>
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
            <label htmlFor="signup-password" className="form-label">Password</label>
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
            <label htmlFor="signup-currentLocation" className="form-label">Your City</label>
            <select
              id="signup-currentLocation"
              value={`${currentLocation.coordinates[0]},${currentLocation.coordinates[1]}`}
              onChange={(event) => setLocation({
                type: 'Point',
                coordinates: event.target.value.split(',').map(x => parseFloat(x))
              })}
              className="form-input"
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

          <button type="submit" className="btn btn-primary">
            Create Account
          </button>

          <div className="text-center mt-md">
            <p className="m-0">
              Already have an account?{' '}
              <Link to="/users/login">
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
