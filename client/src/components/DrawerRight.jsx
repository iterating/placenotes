import React, { useEffect, useState, useCallback, useRef } from 'react';
import MessageList from '../features/messages/components/MessageList';
import './DrawerRight.css';

const DrawerRight = ({ isOpen, onClose, mapCenter }) => {
  const drawerRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const onTouchStart = useCallback((e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const onTouchMove = useCallback((e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && isOpen) {
      onClose();
    } else if (isRightSwipe && !isOpen && touchStart > window.innerWidth - 50) {
      onClose(false);
    }
  }, [touchStart, touchEnd, isOpen, onClose]);

  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer) return;

    drawer.addEventListener('touchstart', onTouchStart);
    drawer.addEventListener('touchmove', onTouchMove);
    drawer.addEventListener('touchend', onTouchEnd);

    return () => {
      drawer.removeEventListener('touchstart', onTouchStart);
      drawer.removeEventListener('touchmove', onTouchMove);
      drawer.removeEventListener('touchend', onTouchEnd);
    };
  }, [onTouchStart, onTouchMove, onTouchEnd]);

  return (
    <>
      <div 
        ref={drawerRef}
        className={`drawer-right ${isOpen ? 'open' : ''}`}
      >
        <MessageList 
          isOpen={isOpen}
          onClose={onClose}
          mapCenter={mapCenter}
        />
      </div>
      {isOpen && (
        <div 
          className="drawer-right-overlay" 
          onClick={onClose}
        />
      )}
    </>
  );
};

export default DrawerRight;
