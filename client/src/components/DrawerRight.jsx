import React, { useEffect } from 'react';
import MessageList from '../features/messages/components/MessageList';
import './drawers.css';

const DrawerRight = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <div 
      className={`drawer-right ${isOpen ? 'open' : ''} drawer-base`}
      role="complementary"
      aria-label="Notifications panel"
    >
      <div className="drawer-header border-b p-md flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="m-0 font-semibold text-primary">Notifications</h3>
          <button 
            className="close-button p-sm rounded-full hover:bg-gray-100" 
            onClick={onClose}
            aria-label="Close notifications panel"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="drawer-content flex-1 overflow-y-auto p-sm">
        <MessageList isOpen={isOpen} />
      </div>
    </div>
  );
};

export default DrawerRight;
