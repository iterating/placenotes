import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../store/authSlice.js';
import { clearNotes } from '../store/noteSlice.js';
import defaultAvatar from '../assets/default-avatar.svg';
import './Drawer.css';

const Drawer = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearNotes());
    navigate('/users/login');
    onClose();
  };

  return (
    <div 
      className={`drawer ${isOpen ? 'open' : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="drawer-header">
        <div className="user-profile">
          <div className="avatar">
            <img 
              src={user?.avatar || defaultAvatar} 
              alt={`${user?.username || 'User'}'s avatar`}
              className="avatar-image"
            />
          </div>
          <div className="user-info">
            <h3 className="username">{user?.name || 'Welcome'}</h3>
            <p className="email">{user?.email}</p>
          </div>
        </div>
      </div>

      <nav className="drawer-content">
        <Link 
          to="/notes" 
          className={`drawer-item ${location.pathname === '/notes' ? 'active' : ''}`}
          onClick={onClose}
        >
          <span className="drawer-icon">🏠</span>
          Home
        </Link>
        <Link 
          to="/notes/new" 
          className={`drawer-item ${location.pathname === '/notes/new' ? 'active' : ''}`}
          onClick={onClose}
        >
          <span className="drawer-icon">📝</span>
          New Note
        </Link>
        <Link 
          to="/users/settings" 
          className={`drawer-item ${location.pathname === '/users/settings' ? 'active' : ''}`}
          onClick={onClose}
        >
          <span className="drawer-icon">🗺️</span>
          Settings
        </Link>
        <button 
          className="drawer-item"
          onClick={handleLogout}
        >
          <span className="drawer-icon">🚪</span>
          Logout
        </button>
      </nav>
    </div>
  );
};

export default Drawer;
