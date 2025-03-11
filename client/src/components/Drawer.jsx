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
      className={`drawer ${isOpen ? 'open' : ''} drawer-base`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="drawer-header border-b p-md flex-shrink-0">
        <div className="user-profile flex items-center gap-md">
          <div className="avatar rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
            <img 
              src={user?.avatar || defaultAvatar} 
              alt={`${user?.username || 'User'}'s avatar`}
              className="w-full h-full"
            />
          </div>
          <div className="user-info flex-1">
            <h3 className="username m-0 font-semibold text-primary">{user?.name || 'Welcome'}</h3>
            <p className="email m-0 text-sm text-secondary">{user?.email}</p>
          </div>
        </div>
      </div>

      <nav className="drawer-content flex-1 overflow-y-auto p-sm">
        <Link 
          to="/notes" 
          className={`drawer-item flex items-center gap-md p-md text-primary rounded-md ${location.pathname === '/notes' ? 'active bg-primary-light text-primary-color' : ''}`}
          onClick={onClose}
        >
          <span className="drawer-icon flex-shrink-0 flex items-center justify-center">🏠</span>
          Home
        </Link>
        <Link 
          to="/notes/new" 
          className={`drawer-item flex items-center gap-md p-md text-primary rounded-md ${location.pathname === '/notes/new' ? 'active bg-primary-light text-primary-color' : ''}`}
          onClick={onClose}
        >
          <span className="drawer-icon flex-shrink-0 flex items-center justify-center">📝</span>
          New Note
        </Link>
        <Link 
          to="/users/settings" 
          className={`drawer-item flex items-center gap-md p-md text-primary rounded-md ${location.pathname === '/users/settings' ? 'active bg-primary-light text-primary-color' : ''}`}
          onClick={onClose}
        >
          <span className="drawer-icon flex-shrink-0 flex items-center justify-center">🗺️</span>
          Settings
        </Link>
        <button 
          className="drawer-item flex items-center gap-md p-md text-primary rounded-md w-full text-left"
          onClick={handleLogout}
        >
          <span className="drawer-icon flex-shrink-0 flex items-center justify-center">🚪</span>
          Logout
        </button>
      </nav>
    </div>
  );
};

export default Drawer;
