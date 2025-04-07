import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../store/authSlice.js';
import { clearNotes } from '../store/noteSlice.js';
import defaultAvatar from '../assets/default-avatar.svg';
import './drawers.css';

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

  // Simplified common classes
  const drawerItemClass = "drawer-item flex items-center gap-md p-md rounded-md w-full";
  const iconClass = "drawer-icon";

  return (
    <div 
    className={`drawer ${isOpen ? 'open' : ''} drawer-base`}
    role="navigation"
      aria-label="Main navigation"
    >
      <div className="drawer-header border-b p-md">
        <div className="flex flex-col items-center gap-md">
          <div className="rounded-full overflow-hidden bg-gray-100">
            <img 
              src={user?.avatar || defaultAvatar} 
              alt={`${user?.username || 'User'}'s avatar`}
              className="w-full h-full"
            />
          </div>
          <div className="text-center">
            <h3 className="username font-semibold">{user?.name || 'Welcome'}</h3>
            <p className="email text-sm">{user?.email}</p>
          </div>
        </div>
      </div>

      <nav className="drawer-content p-sm">
        <Link 
          to="/notes" 
          className={`${drawerItemClass} ${location.pathname === '/notes' ? 'active' : ''}`}
          onClick={onClose}
        >
          <span className={iconClass}>🏠</span>
          Home
        </Link>
        <Link 
          to="/notes/new" 
          className={`${drawerItemClass} ${location.pathname === '/notes/new' ? 'active' : ''}`}
          onClick={onClose}
        >
          <span className={iconClass}>📝</span>
          New Note
        </Link>
        <Link 
          to="/friends" 
          className={`${drawerItemClass} ${location.pathname === '/friends' ? 'active' : ''}`}
          onClick={onClose}
        > 
          <span className={iconClass}>👥</span>
          Friends
        </Link>
        <Link 
          to="/search"
          className={`${drawerItemClass} ${location.pathname === '/search' ? 'active' : ''}`}
          onClick={onClose}
        >
          <span className={iconClass}>🔍</span>
          Search Notes
        </Link>
        <Link 
          to="/users/settings" 
          className={`${drawerItemClass} ${location.pathname === '/users/settings' ? 'active' : ''}`}
          onClick={onClose}
        >
          <span className={iconClass}>⚙️</span>
          Settings
        </Link>
        <button 
          className={`${drawerItemClass} text-left`}
          onClick={handleLogout}
        >
          <span className={iconClass}>🚪</span>
          Logout
        </button>
      </nav>
    </div>
  );
};

export default Drawer;
