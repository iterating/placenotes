import React, { useState, useEffect } from 'react';
import Drawer from './Drawer';
import DrawerRight from './DrawerRight';
import './Heading.css';
import './drawers.css';

const Heading = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMessageDrawerOpen, setIsMessageDrawerOpen] = useState(false);

  useEffect(() => {
    // Handle body class for scroll locking
    if (isDrawerOpen || isMessageDrawerOpen) {
      document.body.classList.add(isDrawerOpen ? 'drawer-open' : 'drawer-right-open');
    } else {
      document.body.classList.remove('drawer-open', 'drawer-right-open');
    }

    // Handle content shift for left drawer
    const content = document.getElementById('content');
    if (content) {
      if (isDrawerOpen) {
        content.classList.add('drawer-open');
      } else {
        content.classList.remove('drawer-open');
      }
    }

    return () => {
      document.body.classList.remove('drawer-open', 'drawer-right-open');
      if (content) {
        content.classList.remove('drawer-open');
      }
    };
  }, [isDrawerOpen, isMessageDrawerOpen]);

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const handleMessageDrawerClose = () => {
    setIsMessageDrawerOpen(false);
  };

  return (
    <div className="drawer-buttons-container">
      {/* Floating left drawer button */}
      <span 
        className="drawer-toggle-button drawer-toggle-left" 
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

      {/* Floating right drawer button */}
      <span 
        className="drawer-toggle-button drawer-toggle-right"
        role="button" 
        tabIndex={0}
        onClick={() => setIsMessageDrawerOpen(!isMessageDrawerOpen)}
        onKeyPress={(e) => e.key === 'Enter' && setIsMessageDrawerOpen(!isMessageDrawerOpen)}
        aria-label="Toggle messages"
        aria-expanded={isMessageDrawerOpen}
      >
        &#9776;
      </span>

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
          if (isDrawerOpen) setIsDrawerOpen(false);
          if (isMessageDrawerOpen) setIsMessageDrawerOpen(false);
        }}
        role="presentation"
        aria-hidden="true"
      />
    </div>
  );
};

export default Heading;
