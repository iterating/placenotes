import React from 'react';
import { Route, Routes } from 'react-router-dom';

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
        </Routes>
      </div>
    </div>
  );
}

export default App;
