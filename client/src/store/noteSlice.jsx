import { createSlice } from '@reduxjs/toolkit';
import { fetchOneNote, editNote, deleteNote } from "./noteStoreAction"

const initialState = {
  notes: {},
  loading: false,
  error: null,
};


const noteSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    fetchOneNote(state) {
      state.loading = true;
    },
    fetchOneNoteSuccess(state, action) {
      state.loading = false;
      state.notes[action.payload.id] = action.payload.note;
    },
    fetchOneNoteFailure(state, action) {
      state.loading = false;
      state.error = action.payload.error;
    },
    editNote(state, action) {
      state.loading = true;
      state.notes[action.payload.id] = action.payload.note;
    },
    updateNoteSuccess(state, action) {
      state.loading = false;
    },
    updateNoteFailure(state, action) {
      state.loading = false;
      state.error = action.payload.error;
    },
    deleteNote(state) {
      state.loading = true;
    },
    deleteNoteSuccess(state, action) {
      state.loading = false;
      delete state.notes[action.payload.id];
    },
    deleteNoteFailure(state, action) {
      state.loading = false;
      state.error = action.payload.error;
    },
  },
});

export default noteSlice;
