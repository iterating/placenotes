import React, { useEffect } from 'react';
import MessageList from '../features/messages/components/MessageList';
import { useDispatch } from 'react-redux';
import { fetchMessages } from '../features/messages/store/messageStoreAction';
import './drawers.css';

const DrawerRight = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  // Refresh messages when drawer opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchMessages());
    }
  }, [isOpen, dispatch]);

  return (
    <div 
      className={`drawer-right ${isOpen ? 'open' : ''} drawer-base`}
      role="complementary"
      aria-label="Messages panel"
    >
      {/* MessageList component now handles its own header */}
      <div className="drawer-content flex-1 overflow-y-auto p-sm">
        <MessageList isOpen={isOpen} />
      </div>
    </div>
  );
};

export default DrawerRight;
