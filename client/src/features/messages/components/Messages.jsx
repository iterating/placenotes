import React, { useEffect, useState } from 'react';
import MessageList from './MessageList';
// Using shared CSS classes instead of component-specific CSS

const Messages = () => {
  return (
    <div className="messages-container">
      <MessageList />
    </div>
  );
};

export default Messages;
