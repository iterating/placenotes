import React, { useState, useEffect } from 'react'
import axios from 'axios';

async function getUser() {
  const { data: user } = await axios.get('/users/account');
  return user;  

}

const Settings = ({ user }) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [friends, setFriends] = useState(user?.friends || []);
  const [friendEmail, setFriendEmail] = useState('')

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setFriends(user?.friends || []);
  }, [user]);

  const handleUsernameChange = (e) => {
    setName(e.target.value);
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  }

  const handleFriendEmailChange = (e) => {
    setFriendEmail(e.target.value);
  }

  const handleAddFriend = (e) => {
    e.preventDefault();
    axios.post('/users/friends', { friendEmail })
    .then(res => res.data)
    .then(data => {
      setFriends(data.friends);
      setFriendEmail('')
    })
    .catch(err => console.log(err));
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

      <h2 class="title">Friends</h2>
      <ul>
        {friends.map(friend => <li key={friend}>{friend}</li>)}
      </ul>
      <form class="edit-note-form" onSubmit={handleAddFriend}>
        <label for="friendEmail">Email:</label><br />
        <input type="email" name="friendEmail" id="friendEmail" value={friendEmail} onChange={handleFriendEmailChange} /><br />
        <button type="submit">Add Friend</button>
      </form>
      <form action="/users/account/delete" method="post" class="button">
        <button type="submit">Delete Account</button>
      </form>
    </div>
  );
};

export default Settings;


