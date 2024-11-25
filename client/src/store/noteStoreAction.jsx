import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchOneNote = createAsyncThunk(
  'notes/fetchOneNote',
  async ({ token, id }) => {
    const response = await axios.get(`http://localhost:5000/notes/${id}`, {
      headers: {
        Authorization: `${token}`,
      },
    });
    return response.data;
  }
);
export const editNote = createAsyncThunk(
  'notes/editNote',
  async ({ token, id, note }) => {
    const response = await axios.put(`http://localhost:5000/notes/${id}`, note, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }
)
export const updateNote = createAsyncThunk(
  'notes/updateNote',
  async ({ token, id, note }) => {
    console.log('UpdateNote: Sending request to update note', id);
    const response = await axios.put(`http://localhost:5000/notes/${id}`, note, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('UpdateNote: Response received', response.data);
    return response.data;
  }
);
export const createNote = createAsyncThunk(
  'notes/createNote',
  async ({ token, note }) => {
    console.log('CreateNote: Sending request to create note');
    const response = await axios.post('http://localhost:5000/notes', note, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('CreateNote: Response received', response.data);
    return response.data;
  }
)
export const deleteNote = createAsyncThunk(
  'notes/deleteNote',
  async ({ token, id }) => {
    const response = await axios.delete(`http://localhost:5000/notes/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }
);

export const SET_CURRENT_LOCATION = 'SET_CURRENT_LOCATION';

export const setCurrentLocation = (location) => ({
  type: SET_CURRENT_LOCATION,
  payload: location,
});