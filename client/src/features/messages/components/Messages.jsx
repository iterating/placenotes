import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages } from '../store/messageSlice';
import { selectMessages } from '../store/messageSlice';
import MessageList from './MessageList';
// Using shared CSS classes instead of component-specific CSS

const Messages = ({ isOpen, onClose, mapCenter }) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

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
    
    if (isLeftSwipe && isOpen) {
      onClose();
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

  return (
    <>
      <MessageList 
        isOpen={isOpen} 
        onClose={onClose}
        mapCenter={mapCenter}
      />
      {isOpen && (
        <div 
          className="overlay open" 
          onClick={onClose}
        />
      )}
    </>
  );
};

export default Messages;
