import React from 'react'

async function getUser() {
  const response = await fetch('/users/account');
  const user = await response.json();
  return user;  

}

const Settings = ({ user }) => {
  return (
    <div class="edit-container">
      <h1 class="title">User Settings</h1>
      <form action="/users/account" method="post" class="edit-note-form">
        <label for="name">Username:</label><br />
        {/* <input type="text" name="name" id="name" value={user.name || ''} /><br /> */}
        <label for="email">Email:</label><br />
        {/* <input type="email" name="email" id="email" value={user.email} /><br /> */}
  

        <button type="submit">Save Changes</button>
      </form>
      <form action="/users/account/delete" method="post" class="button">
        <button type="submit">Delete Account</button>
      </form>
    </div>
  );
};

export default Settings;
