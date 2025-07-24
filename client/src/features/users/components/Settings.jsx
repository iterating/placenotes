import React, { useState, useEffect } from 'react'
import { apiClient } from '../../../api/apiClient';

async function getUser() {
  const { data: user } = await apiClient.get('/users/account');
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
    apiClient.post('/users/friends', { friendEmail })
    .then(res => res.data)
    .then(data => {
      setFriends(data.friends);
      setFriendEmail('')
    })
    .catch(err => console.log(err));
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    apiClient.put('/users/account', { name, email })
    .then(res => res.data)
    .then(data => console.log(data))
    .catch(err => console.log(err));
  }

  return (
    <div className="container">
      <h1 className="page-title mb-lg">User Settings</h1>
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label htmlFor="name" className="form-label">Username:</label>
          <input 
            type="text" 
            name="name" 
            id="name" 
            value={name} 
            onChange={handleUsernameChange}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email:</label>
          <input 
            type="email" 
            name="email" 
            id="email" 
            value={email} 
            onChange={handleEmailChange}
            className="form-input"
          />
        </div>
        <button type="submit" className="btn btn-primary">Save Changes</button>
      </form>

      <h2 className="section-title mt-lg mb-md">Friends</h2>
      <ul className="list">
        {friends.map(friend => <li key={friend} className="list-item">{friend}</li>)}
      </ul>
      <form className="form-container mt-md" onSubmit={handleAddFriend}>
        <div className="form-group">
          <label htmlFor="friendEmail" className="form-label">Friend's Email:</label>
          <input 
            type="email" 
            name="friendEmail" 
            id="friendEmail" 
            value={friendEmail} 
            onChange={handleFriendEmailChange}
            className="form-input"
          />
        </div>
        <button type="submit" className="btn btn-primary">Add Friend</button>
      </form>
      <form action="/api/users/account/delete" method="post" className="mt-lg">
        <button type="submit" className="btn btn-danger">Delete Account</button>
      </form>
    </div>
  );
};

export default Settings;
