import React, { useState, useEffect, useRef } from 'react';
import Drawer from './Drawer';
import DrawerRight from './DrawerRight';
import './Heading.css';
import './drawers.css';

const Heading = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMessageDrawerOpen, setIsMessageDrawerOpen] = useState(false);
  const [leftIndicatorActive, setLeftIndicatorActive] = useState(false);
  const [rightIndicatorActive, setRightIndicatorActive] = useState(false);
  
  // Touch handling references
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const windowWidth = useRef(window.innerWidth);
  const EDGE_THRESHOLD = 30; // Pixels from edge to start swipe detection
  const MIN_SWIPE_DISTANCE = 70; // Minimum swipe distance to trigger drawer
  const isTouchMoving = useRef(false);

  useEffect(() => {
    // Handle window resize
    const handleResize = () => {
      windowWidth.current = window.innerWidth;
    };
    
    window.addEventListener('resize', handleResize);
    
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
      window.removeEventListener('resize', handleResize);
    };
  }, [isDrawerOpen, isMessageDrawerOpen]);

  // Touch event handlers for swipe gestures
  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartX.current = e.touches[0].clientX;
      isTouchMoving.current = false;
      
      // Show edge indicators when touch starts near edges
      if (touchStartX.current < EDGE_THRESHOLD && !isDrawerOpen) {
        setLeftIndicatorActive(true);
      } else if (touchStartX.current > (windowWidth.current - EDGE_THRESHOLD) && !isMessageDrawerOpen) {
        setRightIndicatorActive(true);
      }
    };

    const handleTouchMove = (e) => {
      if (touchStartX.current === null) return;
      
      const currentX = e.touches[0].clientX;
      isTouchMoving.current = true;
      
      // Calculate swipe distance so far
      const swipeDistanceSoFar = currentX - touchStartX.current;
      const swipeFromLeft = touchStartX.current < EDGE_THRESHOLD;
      const swipeFromRight = touchStartX.current > (windowWidth.current - EDGE_THRESHOLD);
      
      // Update indicators based on swipe direction and distance
      if (swipeFromLeft && swipeDistanceSoFar > 0) {
        setLeftIndicatorActive(true);
      } else if (swipeFromRight && swipeDistanceSoFar < 0) {
        setRightIndicatorActive(true);
      }
    };

    const handleTouchEnd = (e) => {
      // Hide indicators when touch ends
      setLeftIndicatorActive(false);
      setRightIndicatorActive(false);
      
      // No start touch recorded or not moving (was a tap)
      if (touchStartX.current === null || !isTouchMoving.current) {
        return;
      }
      
      touchEndX.current = e.changedTouches[0].clientX;
      
      // Calculate swipe distance
      const swipeDistance = touchEndX.current - touchStartX.current;
      const swipeFromLeft = touchStartX.current < EDGE_THRESHOLD;
      const swipeFromRight = touchStartX.current > (windowWidth.current - EDGE_THRESHOLD);
      
      // Right swipe from left edge (to open left drawer)
      if (swipeFromLeft && swipeDistance > MIN_SWIPE_DISTANCE && !isDrawerOpen) {
        setIsDrawerOpen(true);
      }
      
      // Left swipe from right edge (to open right drawer)
      if (swipeFromRight && swipeDistance < -MIN_SWIPE_DISTANCE && !isMessageDrawerOpen) {
        setIsMessageDrawerOpen(true);
      }
      
      // Reset touch values
      touchStartX.current = null;
      touchEndX.current = null;
      isTouchMoving.current = false;
    };
    
    // Add touch event listeners
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      // Clean up event listeners
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
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

      {/* Swipe indicators */}
      <div 
        className={`swipe-indicator-left ${leftIndicatorActive ? 'active' : ''}`} 
        aria-hidden="true"
      />
      <div 
        className={`swipe-indicator-right ${rightIndicatorActive ? 'active' : ''}`}
        aria-hidden="true"
      />

      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
      />

      <DrawerRight
        isOpen={isMessageDrawerOpen}
        onClose={handleMessageDrawerClose}
      />

      <div 
        className={`overlay ${isDrawerOpen || isMessageDrawerOpen ? 'open' : ''} ${isDrawerOpen ? 'left-drawer-open' : ''} ${isMessageDrawerOpen ? 'right-drawer-open' : ''}`}
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
