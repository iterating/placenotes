import React, { useEffect, useCallback } from 'react';
import Drawer from './Drawer';
import SearchBar from './SearchBar';
import './Heading.css';

const Heading = () => {
  const toggleDrawer = useCallback((e) => {
    e.preventDefault();
    const drawer = document.getElementById("drawer");
    const overlay = document.getElementById("overlay");
    const content = document.getElementById("content");

    if (drawer && overlay && content) {
      drawer.classList.toggle("open");
      overlay.classList.toggle("open");
      content.classList.toggle("drawer-open");
    }
  }, []);

  useEffect(() => {
    const drawerIcon = document.querySelector(".drawer-icon");
    const overlay = document.querySelector(".overlay");

    if (drawerIcon) {
      drawerIcon.addEventListener("click", toggleDrawer);
    }
    if (overlay) {
      overlay.addEventListener("click", toggleDrawer);
    }

    return () => {
      if (drawerIcon) {
        drawerIcon.removeEventListener("click", toggleDrawer);
      }
      if (overlay) {
        overlay.removeEventListener("click", toggleDrawer);
      }
    };
  }, [toggleDrawer]);

  return (
    <div>
      <header className="app-header">
        <div className="header-left">
          <span className="drawer-icon" id="sidebar-icon" role="button" tabIndex={0}>&#9776;</span>
        </div>
        <SearchBar />
        <div className="header-right">
          {/* Add any right-side header content here */}
        </div>
        <Drawer />
        <div className="overlay" id="overlay" role="presentation"></div>
      </header>
    </div>
  );
};

export default Heading;
