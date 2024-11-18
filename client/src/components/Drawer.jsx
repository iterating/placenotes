import React from 'react';

const DrawerContent = () => {
  return (
    <div className="drawer" id="drawer">
      <a href="/notes">Home</a>
      <a href="/notes/new">New Note</a>
      <a href="/users/account">Settings</a>
      <a href="/users/logout">Logout</a>
    </div>
  );
};

export default DrawerContent;
