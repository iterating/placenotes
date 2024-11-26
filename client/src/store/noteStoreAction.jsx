import { createSelector } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const selectToken = (state) => state.auth.token;

export const fetchUsersNotes = createAsyncThunk(
  'notes/fetchUsersNotes',
  async (_, { getState }) => {
    const token = selectToken(getState());
    console.log('FetchUsersNotes: Fetching notes');
    console.log('FetchUsersNotes: Using token', token);
    const response = await axios.get('/notes', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('FetchUsersNotes: Response received', response.data);
    return response.data;
  }
);

export const fetchOneNote = createAsyncThunk(
  'notes/fetchOneNote',
  async ({ id }, { getState }) => {
    console.log('FetchOneNote: Fetching note', id);
    const token = selectToken(getState());
    console.log('FetchOneNote: Using token', token);
    const response = await axios.get(`http://localhost:5000/notes/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('FetchOneNote: Response received', response.data);
    return response.data;
  }
);

export const editNote = createAsyncThunk(
  'notes/editNote',
  async ({ id, note }, { getState }) => {
    console.log('EditNote: Sending request to edit note', id);
    console.log('EditNote: Note contents', note);
    const token = selectToken(getState());
    console.log('EditNote: Using token', token);
    const response = await axios.patch(`http://localhost:5000/notes/${id}`, note, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('EditNote: Response received', response.data);
    return response.data;
  }
);

export const createNote = createAsyncThunk(
  'notes/createNote',
  async ({ note }, { getState }) => {
    console.log('CreateNote: Sending request to create note');
    console.log('CreateNote: Note contents', note);
    console.log('CreateNote: Note location', note.longitude, note.latitude);
    console.log('CreateNote: Note radius', note.radius);
    console.log('CreateNote: Note email', note.email);
    console.log('CreateNote: Note userId', note.userId);
    console.log('CreateNote: Note time', note.time);
    const token = selectToken(getState());
    console.log('CreateNote: Using token', token);
  
    const response = await axios.post('http://localhost:5000/notes/new', {
      ...note,
    }, { 
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('CreateNote: Response received', response.data);
    return response.data;
  }
);

export const deleteNote = createAsyncThunk(
  'notes/deleteNote',
  async ({ id }, { getState }) => {
    console.log('DeleteNote: Sending request to delete note', id);
    const token = selectToken(getState());
    console.log('DeleteNote: Using token', token);
    const response = await axios.delete(`http://localhost:5000/notes/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('DeleteNote: Response received', response.data);
    return response.data;
  }
);

export const SET_CURRENT_LOCATION = 'SET_CURRENT_LOCATION';

export const setCurrentLocation = (location) => ({
  type: SET_CURRENT_LOCATION,
  payload: location,
});

