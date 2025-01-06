import React, { useEffect, useCallback, useState } from 'react';
import Drawer from './Drawer';
import DrawerRight from './DrawerRight';
import SearchBar from './SearchBar';
import MessageList from '../features/messages/components/MessageList';
import './Heading.css';

const Heading = () => {
  const [isMessageDrawerOpen, setIsMessageDrawerOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);

  const minSwipeDistance = 50;

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
    
    if (isLeftSwipe && !isMessageDrawerOpen) {
      setIsMessageDrawerOpen(true);
    } else if (isRightSwipe && isMessageDrawerOpen) {
      setIsMessageDrawerOpen(false);
    }
  };

  useEffect(() => {
    const drawerIcon = document.querySelector(".drawer-icon");
    const overlay = document.querySelector(".overlay");

    if (drawerIcon) {
      drawerIcon.addEventListener("click", toggleDrawer);
    }
    if (overlay) {
      overlay.addEventListener("click", toggleDrawer);
    }

    document.addEventListener('touchstart', onTouchStart);
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onTouchEnd);

    return () => {
      if (drawerIcon) {
        drawerIcon.removeEventListener("click", toggleDrawer);
      }
      if (overlay) {
        overlay.removeEventListener("click", toggleDrawer);
      }
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [toggleDrawer, touchStart, touchEnd]);

  return (
    <div className="header-container">
      <header className="app-header">
        <div className="header-left">
          <span className="drawer-icon" id="sidebar-icon" role="button" tabIndex={0}>&#9776;</span>
        </div>
        <SearchBar />
        <div className="header-right">
          <span 
            className="message-drawer-icon" 
            role="button" 
            tabIndex={0}
            onClick={() => setIsMessageDrawerOpen(!isMessageDrawerOpen)}
          >
            <i className="fas fa-comments"></i>
          </span>
        </div>
      </header>
      <Drawer />
      <DrawerRight
        isOpen={isMessageDrawerOpen}
        onClose={() => setIsMessageDrawerOpen(false)}
        mapCenter={mapCenter}
      />
      <MessageList
        isOpen={isMessageDrawerOpen}
        onClose={() => setIsMessageDrawerOpen(false)}
      />
      <div id="overlay" className="overlay"></div>
    </div>
  );
};

export default Heading;
