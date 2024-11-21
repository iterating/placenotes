import React from 'react';

const Settings = ({ user }) => (
  <>
    <div className="edit-container">
      <h1 className="title">User Settings</h1>
      <form action="/users/account" method="post" className="edit-note-form">
        <label htmlFor="name">Username:</label><br />
        <input type="text" name="name" id="name" defaultValue={user.name || ''} /><br />
        <label htmlFor="email">Email:</label><br />
        <input type="email" name="email" id="email" defaultValue={user.email} /><br />
      
        <label htmlFor="darkMode">Dark Mode:</label><br />
        <input type="checkbox" name="darkMode" id="darkMode" defaultChecked={user.darkMode} /><br />
        <button type="submit">Save Changes</button>
      </form>
      <form action="/users/account/delete" method="post" className="button">
        <button type="submit">Delete Account</button>
      </form>
    </div>
  </>
);

export default Settings;

