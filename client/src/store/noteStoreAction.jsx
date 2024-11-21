import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchOneNote = createAsyncThunk(
  'notes/fetchOneNote',
  async ({ token, id }) => {
    const response = await axios.get(`/api/notes/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }
);

export const updateNote = createAsyncThunk(
  'notes/updateNote',
  async ({ token, id, note }) => {
    const response = await axios.put(`/api/notes/${id}`, note, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }
);

export const deleteNote = createAsyncThunk(
  'notes/deleteNote',
  async ({ token, id }) => {
    const response = await axios.delete(`/api/notes/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }
);