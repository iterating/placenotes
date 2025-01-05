import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Main from './Main';
import Login from './users/Login';
import Signup from './users/Signup';
import Heading from '../components/Heading';
import Notes from './notes/Notes';
import NoteNew from './notes/NoteNew';
import NoteEdit from './notes/NoteEdit';
import Settings from './users/Settings';
import RequireAuth from './auth/RequireAuth';

function Router() {
  return (
    <div className="app-container">
      <Heading />
      <div id="content" className="content-container">
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/users/login" element={<Login />} />
          <Route path="/users/signup" element={<Signup />} />
          <Route path="/notes" element={
            <RequireAuth>
              <Notes />
            </RequireAuth>
          } />
          <Route path="/notes/new" element={
            <RequireAuth>
              <NoteNew />
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

export default Router;
