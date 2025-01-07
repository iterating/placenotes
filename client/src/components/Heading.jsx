import React, { useState } from 'react';
import Drawer from './Drawer';
import DrawerRight from './DrawerRight';
import SearchBar from '../features/search/SearchBar';
import './Heading.css';

const Heading = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMessageDrawerOpen, setIsMessageDrawerOpen] = useState(false);

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const handleMessageDrawerClose = () => {
    setIsMessageDrawerOpen(false);
  };

  return (
    <div className="header-container">
      <header className="app-header">
        <div className="header-left">
          <span 
            className="drawer-icon" 
            id="sidebar-icon" 
            role="button" 
            tabIndex={0}
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            onKeyPress={(e) => e.key === 'Enter' && setIsDrawerOpen(!isDrawerOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isDrawerOpen}
          >
            &#9776;
          </span>
        </div>
        <SearchBar />
        <div className="header-right">
          <span 
            className="drawer-icon"
            role="button" 
            tabIndex={0}
            onClick={() => setIsMessageDrawerOpen(!isMessageDrawerOpen)}
            onKeyPress={(e) => e.key === 'Enter' && setIsMessageDrawerOpen(!isMessageDrawerOpen)}
            aria-label="Toggle messages"
            aria-expanded={isMessageDrawerOpen}
          >
            &#9776;
          </span>
        </div>
      </header>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
      />

      <DrawerRight
        isOpen={isMessageDrawerOpen}
        onClose={handleMessageDrawerClose}
      />

      <div 
        className={`overlay ${isDrawerOpen || isMessageDrawerOpen ? 'open' : ''}`}
        onClick={() => {
          if (isDrawerOpen) handleDrawerClose();
          if (isMessageDrawerOpen) handleMessageDrawerClose();
        }}
        role="presentation"
      />
    </div>
  );
};

export default Heading;
