import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Main from './Main';
import Login from './users/Login';
import Signup from './users/Signup';
import Header from '../components/Header';
import Notes from './notes/Notes';
import NoteForm from './notes/NoteForm';
import NotesEdit from './notes/NoteEdit';

function AppRouter() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/users/login" element={<Login />} />
        <Route path="/users/signup" element={<Signup />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/notes/:id/edit" element={<NotesEdit />} />
        <Route path="/notes/new" element={<NoteForm />} />
      </Routes>
    </>
  );
}

export default AppRouter;

