import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { SERVER } from '../../../app/config';

async function getUser() {
  const { data: user } = await axios.get(`${SERVER}/users/account`);
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
    axios.post(`${SERVER}/users/friends`, { friendEmail })
    .then(res => res.data)
    .then(data => {
      setFriends(data.friends);
      setFriendEmail('')
    })
    .catch(err => console.log(err));
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put(`${SERVER}/users/account`, { name, email })
    .then(res => res.data)
    .then(data => console.log(data))
    .catch(err => console.log(err));
  }

  return (
    <div className="edit-container">
      <h1 className="title">User Settings</h1>
      <form action="/users/account" method="post" className="edit-note-form" onSubmit={handleSubmit}>
        <label htmlFor="name">Username:</label>
        <input 
          type="text" 
          name="name" 
          id="name" 
          value={name} 
          onChange={handleUsernameChange}
          className="form-input"
        />
        <label htmlFor="email">Email:</label>
        <input 
          type="email" 
          name="email" 
          id="email" 
          value={email} 
          onChange={handleEmailChange}
          className="form-input"
        />
        <button type="submit" className="btn btn-primary">Save Changes</button>
      </form>

      <h2 className="title">Friends</h2>
      <ul className="friends-list">
        {friends.map(friend => <li key={friend}>{friend}</li>)}
      </ul>
      <form className="edit-note-form" onSubmit={handleAddFriend}>
        <label htmlFor="friendEmail">Email:</label>
        <input 
          type="email" 
          name="friendEmail" 
          id="friendEmail" 
          value={friendEmail} 
          onChange={handleFriendEmailChange}
          className="form-input"
        />
        <button type="submit" className="btn btn-primary">Add Friend</button>
      </form>
      <form action="/users/account/delete" method="post" className="delete-account-form">
        <button type="submit" className="btn btn-danger">Delete Account</button>
      </form>
    </div>
  );
};

export default Settings;
