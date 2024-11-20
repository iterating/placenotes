import React from 'react';
import {
  Route,
  Routes,
} from 'react-router-dom';

const Main = React.lazy(() => import('./Main'));
const Login = React.lazy(() => import('./users/Login'));
const Signup = React.lazy(() => import('./users/Signup'));
const Header = React.lazy(() => import('../components/Header'));
const Notes = React.lazy(() => import('./notes/Notes'));
const NoteForm = React.lazy(() => import('./notes/NoteForm'));

function AppRouter() {
  return (
    <>
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <React.Suspense fallback={<div>Loading...</div>}>
              <Main />
            </React.Suspense>
          }
        />
        <Route
          path="/users/login"
          element={
            <React.Suspense fallback={<div>Loading...</div>}>
              <Login />
            </React.Suspense>
          }
        />
        <Route
          path="/users/signup"
          element={
            <React.Suspense fallback={<div>Loading...</div>}>
              <Signup />
            </React.Suspense>
          }
        />
        <Route
          path="/notes"
          element={
            <React.Suspense fallback={<div>Loading...</div>}>
              <Notes />
            </React.Suspense>
          }
        />
        <Route
          path="/notes/new"
          element={
            <React.Suspense fallback={<div>Loading...</div>}>
              <NoteForm />
            </React.Suspense>
          }
        />
    </Routes>
  </>
  );
}

export default AppRouter;

