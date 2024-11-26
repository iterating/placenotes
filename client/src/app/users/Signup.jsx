import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// BASE_URL = 'http://localhost:5000';

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentLocation, setLocation] = useState({
    type: 'Point',
    coordinates: [-118.243683, 34.052235]
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Signup: Handling submit');
    console.log(`Signup: Email entered: ${email}`);
    console.log(`Signup: Password entered: ${password}`);
    console.log(`Signup: Location entered: ${currentLocation.type}, ${currentLocation.coordinates.join(', ')}`);

    try {
      const response = await axios.post('http://localhost:5000//users/signup', {
        email,
        password,
        location: JSON.stringify(currentLocation),
      });
      console.log('Signup: Response from server:', response.data);
      const data = response.data;
      console.log('Signup: Success');
      // Store the token in session storage
      sessionStorage.token = data.token;
      // Redirect to notes page
      navigate('/notes');
    } catch (error) {
      console.error('Error signing up:', error);
    }
  };

  return (
    <div id="form">
      <h1 className="title">Signup</h1>
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

