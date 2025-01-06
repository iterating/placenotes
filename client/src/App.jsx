import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import './App.css';
import { SERVER } from './app/config';
import { getToken } from './lib/tokenManager';
import { setToken, setUser } from './store/authSlice';
import apiClient from './api/apiClient';

//auth persist
import { PersistGate } from 'redux-persist/integration/react';
import { persistor } from './store/store';


// Feature imports
import Login from './features/users/components/Login';
import Signup from './features/users/components/Signup';
import Settings from './features/users/components/Settings';
import Notes from './features/notes/components/Notes';
import NoteEdit from './features/notes/components/NoteEdit';
import SearchResults from './features/notes/components/SearchResults';
import Heading from './components/Heading';
import RequireAuth from './components/auth/RequireAuth';
import Home from './components/Home';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          dispatch(setToken(token));
          const response = await apiClient.get('/users/account');
          
          if (response.data) {
            dispatch(setUser(response.data));
          } else {
            dispatch(setToken(null));
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          dispatch(setToken(null));
          localStorage.removeItem('token');
        }
      }
    };

    initAuth();
  }, [dispatch]);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>

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
        </Routes>
      </div>
    </div>
    </PersistGate>
    </Provider>
  );
}

export default App;
