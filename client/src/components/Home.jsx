import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome to PlaceNotes</h1>
        <p>Your personal space for location-based note-taking</p>
        
        <div className="cta-buttons">
          <Link to="/users/signup" className="btn btn-primary btn-lg">
            Get Started
          </Link>
          <Link to="/users/login" className="btn btn-outline-primary btn-lg">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
