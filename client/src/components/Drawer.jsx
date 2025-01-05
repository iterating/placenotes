import React from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice.jsx';
import { clearNotes } from '../store/noteSlice.jsx';

const DrawerContent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  return (
    <div className="drawer" id="drawer">
      <Link to="/notes" onClick={handleNavClick}>Home</Link>
      <Link to="/notes/new" onClick={handleNavClick}>New Note</Link>
      <Link to="/users/settings" onClick={handleNavClick}>Settings</Link>
      <Link to="/users/login" onClick={handleLogout}>Logout</Link>
    </div>
  );
};

export default DrawerContent;
