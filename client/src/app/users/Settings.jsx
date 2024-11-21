import React, { useState, useEffect } from 'react'
import axios from 'axios';

async function getUser() {
  const { data: user } = await axios.get('/users/account');
  return user;  

}

const Settings = ({ user }) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
  }, [user]);

  const handleUsernameChange = (e) => {
    setName(e.target.value);
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put('/users/account', { name, email })
    .then(res => res.data)
    .then(data => console.log(data))
    .catch(err => console.log(err));
  }

  return (
    <div class="edit-container">
      <h1 class="title">User Settings</h1>
      <form action="/users/account" method="post" class="edit-note-form" onSubmit={handleSubmit}>
        <label for="name">Username:</label><br />
        <input type="text" name="name" id="name" value={name} onChange={handleUsernameChange} /><br />
        <label for="email">Email:</label><br />
        <input type="email" name="email" id="email" value={email} onChange={handleEmailChange} /><br />
  
        <button type="submit">Save Changes</button>
      </form>
      <form action="/users/account/delete" method="post" class="button">
        <button type="submit">Delete Account</button>
      </form>
    </div>
  );
};

export default Settings;

