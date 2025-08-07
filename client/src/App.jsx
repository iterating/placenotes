import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import './App.css';
import { SERVER } from './app/config';
import { getToken } from './lib/tokenManager';
import { setToken, setUser } from './store/authSlice';
import { apiClient } from './api/apiClient';
import { ToastProvider, useToast, setToastContextForExternalUse } from './components/ToastManager';

// Feature imports
import Login from './features/users/components/Login';
import Signup from './features/users/components/Signup';
import Settings from './features/users/components/Settings';
import Notes from './features/notes/components/Notes';
import NoteEdit from './features/notes/components/NoteEdit';
import SearchResults from './features/search/SearchResults';
import Messages from './features/messages/components/Messages';
import MessageCompose from './features/messages/components/MessageCompose';
import Friends from './features/friends/Friends';
import Heading from './components/Heading';
import RequireAuth from './components/auth/RequireAuth';
import Home from './components/Home';

// Main App content component (separated to allow useToast hook usage)
function AppContent() {
  const dispatch = useDispatch();
  const toast = useToast();
  
  // Make toast available for use outside of React components
  useEffect(() => {
    setToastContextForExternalUse(toast);
  }, [toast]);

  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      
      if (!token) {
        dispatch(setToken(null));
        return;
      }

      try {
        const response = await apiClient.get('/users/account');
        if (response.data) {
          dispatch(setUser(response.data));
          dispatch(setToken(token));
        } else {
          dispatch(setToken(null));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (error.response?.status === 401) {
          dispatch(setToken(null));
        }
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
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          
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
          <Route path="/messages/compose" element={
            <RequireAuth>
              <MessageCompose />
            </RequireAuth>
          } />
          <Route path="/friends" element={
            <RequireAuth>
              <Friends />
            </RequireAuth>
          } />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
