import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../../store/authActions';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validate form
    if (!formData.email || !formData.password || !formData.name) {
      setError('All fields are required');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await dispatch(registerUser(formData)).unwrap();
      navigate('/notes');
    } catch (err) {
      setError(err.message || 'Registration failed');
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="center-container">
      <div className="card form-container">
        <div className="text-center mb-md">
          <h1 className="m-0">Create Account</h1>
          <p className="text-secondary">Join PlaceNotes today</p>
        </div>
        
        {error && (
          <div className="error-message mb-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              disabled={isSubmitting}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={isSubmitting}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={isSubmitting}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              disabled={isSubmitting}
              className="form-input"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary w-100"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="text-center mt-md">
          <p className="m-0">
            Already have an account?{' '}
            <Link to="/login">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
