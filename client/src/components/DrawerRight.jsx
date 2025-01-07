import React from 'react';
import MessageList from '../features/messages/components/MessageList';
import './DrawerRight.css';

const DrawerRight = ({ isOpen, onClose }) => {
  return (
    <div className={`drawer-right ${isOpen ? 'open' : ''}`}>
      <MessageList isOpen={isOpen} />
    </div>
  );
};

export default DrawerRight;
