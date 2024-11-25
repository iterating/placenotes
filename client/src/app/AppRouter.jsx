import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Main from './Main';
import Login from './users/Login';
import Signup from './users/Signup';
import Header from '../components/Header';
import Notes from './notes/Notes';
import NoteNew from './notes/NoteNew';
import NoteEdit from './notes/NoteEdit';
import Settings from './users/Settings';

function Router() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/users/login" element={<Login />} />
        <Route path="/users/signup" element={<Signup />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/users/settings" element={<Settings />} />
        <Route path="/notes/:noteId/edit" element={<NoteEdit />} />
        <Route path="/notes/new" element={<NoteNew />} />
      </Routes>
    </>
  );
}

export default Router;

