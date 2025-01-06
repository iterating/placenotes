import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../store/authSlice.js';
import { clearNotes } from '../store/noteSlice.js';
import defaultAvatar from '../assets/default-avatar.svg';
import './Drawer.css';

const DrawerContent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(state => state.auth.user);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const closeDrawer = () => {
    const drawer = document.getElementById("drawer");
    const overlay = document.getElementById("overlay");
    const content = document.getElementById("content");
    
    if (drawer && overlay && content) {
      drawer.classList.remove("open");
      overlay.classList.remove("open");
      content.classList.remove("drawer-open");
    }
  };

  const openDrawer = () => {
    const drawer = document.getElementById("drawer");
    const overlay = document.getElementById("overlay");
    const content = document.getElementById("content");
    
    if (drawer && overlay && content) {
      drawer.classList.add("open");
      overlay.classList.add("open");
      content.classList.add("drawer-open");
    }
  };

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    const drawer = document.getElementById("drawer");
    const isOpen = drawer?.classList.contains("open");
    
    if (isLeftSwipe && isOpen) {
      closeDrawer();
    } else if (isRightSwipe && !isOpen && touchStart < 50) {
      // Only open if swipe starts from left edge (within 50px)
      openDrawer();
    }
  };

  useEffect(() => {
    document.addEventListener('touchstart', onTouchStart);
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onTouchEnd);

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [touchStart, touchEnd]);

  const handleLogout = (e) => {
    e.preventDefault();
    dispatch(logout());
    dispatch(clearNotes());
    closeDrawer();
    navigate('/users/login');
  };

  const handleNavClick = () => {
    closeDrawer();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="drawer" id="drawer">
      <div className="drawer-header">
        <div className="user-profile">
          <div className="avatar">
            <img src={defaultAvatar} alt="Profile" className="avatar-image" />
          </div>
          <div className="user-info">
            <h3>{user?.name || 'Welcome'}</h3>
            <p>{user?.email}</p>
          </div>
        </div>
      </div>

      <nav className="drawer-nav">
        <Link 
          to="/notes" 
          onClick={handleNavClick}
          className={`nav-item ${isActive('/notes') ? 'active' : ''}`}
        >
          <svg viewBox="0 0 24 24" className="nav-icon">
            <path fill="currentColor" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
          </svg>
          Home
        </Link>

        <Link 
          to="/notes/new" 
          onClick={handleNavClick}
          className={`nav-item ${isActive('/notes/new') ? 'active' : ''}`}
        >
          <svg viewBox="0 0 24 24" className="nav-icon">
            <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          New Note
        </Link>

        <Link 
          to="/users/settings" 
          onClick={handleNavClick}
          className={`nav-item ${isActive('/users/settings') ? 'active' : ''}`}
        >
          <svg viewBox="0 0 24 24" className="nav-icon">
            <path fill="currentColor" d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
          </svg>
          Settings
        </Link>

        <button 
          onClick={handleLogout}
          className="nav-item logout"
        >
          <svg viewBox="0 0 24 24" className="nav-icon">
            <path fill="currentColor" d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
          Logout
        </button>
      </nav>

      <div className="drawer-footer">
      </div>
    </div>
  );
};

export default DrawerContent;
