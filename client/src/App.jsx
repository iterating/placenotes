import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import './App.css';
import { SERVER } from './app/config';
import { getToken } from './lib/tokenManager';
import { setToken, setUser } from './store/authSlice';
import { apiClient } from './api/apiClient';

// Feature imports
import Login from './features/users/components/Login';
import Signup from './features/users/components/Signup';
import Settings from './features/users/components/Settings';
import Notes from './features/notes/components/Notes';
import NoteEdit from './features/notes/components/NoteEdit';
import SearchResults from './features/search/SearchResults';
import Messages from './features/messages/components/Messages';

import Heading from './components/Heading';
import RequireAuth from './components/auth/RequireAuth';
import Home from './components/Home';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await apiClient.get('/users/account');
        if (response.data) {
          dispatch(setUser(response.data));
        } else {
          dispatch(setToken(null));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        dispatch(setToken(null));
      }
    };

    initAuth();
  }, [dispatch]);

  return (
    <div className="app-container">
      <Heading />
      <div id="content" className="content-container">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/users/login" element={<Login />} />
          <Route path="/users/signup" element={<Signup />} />
          
          {/* Protected routes */}
          <Route path="/search" element={
            <RequireAuth>
              <SearchResults />
            </RequireAuth>
          } />
          <Route path="/notes" element={
            <RequireAuth>
              <Notes />
            </RequireAuth>
          } />
          <Route path="/notes/new" element={
            <RequireAuth>
              <NoteEdit />
            </RequireAuth>
          } />
          <Route path="/notes/:id/edit" element={
            <RequireAuth>
              <NoteEdit />
            </RequireAuth>
          } />
          <Route path="/users/settings" element={
            <RequireAuth>
              <Settings />
            </RequireAuth>
          } />
          <Route path="/messages" element={
            <RequireAuth>
              <Messages />
            </RequireAuth>
          } />
          
        </Routes>
      </div>
    </div>
  );
}

export default App;
