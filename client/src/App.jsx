import {
  Route,
  Routes,
} from 'react-router-dom';
// import GroupNotes from './components/GroupNotes';
import Signup from './components/Signup.jsx';
import Login from './components/Login.jsx';
import Main from './components/Main.jsx';
import Header from './components/Header.jsx';
import Notes from './components/Notes.jsx';
// import Note from './components/Note.jsx';
// import NoteForm from './components/NoteForm.jsx';
// import NotesAtLocation from './components/NotesAtLocation';
// import UserNotes from './components/UserNotes';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/notes" element={<Notes />} />
        {/* <Route path="/notes/:id" element={<Note />} /> */}
        {/* <Route path="/notes/new" element={<NoteForm />} /> */}
        {/* <Route path="/notes/:id/edit" element={<NoteForm />} /> */}
        {/* <Route path="/notes/location/:location" element={<NotesAtLocation />} /> */}
        {/* <Route path="/users/:id/notes" element={<UserNotes />} /> */}
        {/* <Route path="/groups/:id/notes" element={<GroupNotes />} /> */}
    </Routes>
  </>
  );
}

export default App;
