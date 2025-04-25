import { createSlice } from '@reduxjs/toolkit';
import {
  fetchUsersNotes,
  fetchNotesByLocation,
  createNote,
  updateNote,
  deleteNote,
  setCurrentLocation
} from './noteThunks';

const normalizeNotes = (notesArray) => {
  return notesArray.reduce((acc, note) => {
    acc[note._id] = note;
    return acc;
  }, {});
};

const initialState = {
  notes: {},
  location: null,
  status: 'idle', 
  error: null,
  isMapExpanded: true,
};

const noteSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    clearNotes: (state) => {
      state.notes = {};
      state.error = null;
      state.status = 'idle';
    },
    setNoteVisibility: (state, action) => {
      const { id, visible } = action.payload;
      const note = state.notes[id];
      if (note) {
        note.showFullNote = visible;
      }
    },
    setLocation: (state, action) => {
      state.location = action.payload;
    },
    toggleNotesPanel: (state) => {
      state.isMapExpanded = !state.isMapExpanded;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersNotes.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUsersNotes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.notes = normalizeNotes(action.payload);
      })
      .addCase(fetchUsersNotes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchNotesByLocation.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchNotesByLocation.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.notes = normalizeNotes(action.payload);
      })
      .addCase(fetchNotesByLocation.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createNote.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const newNote = action.payload;
        state.notes[newNote._id] = newNote;
      })
      .addCase(createNote.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateNote.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedNote = action.payload;
        if (state.notes[updatedNote._id]) {
          state.notes[updatedNote._id] = updatedNote;
        }
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(deleteNote.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const noteId = action.payload;
        delete state.notes[noteId];
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { 
  clearNotes, 
  setNoteVisibility, 
  setLocation, 
  toggleNotesPanel 
} = noteSlice.actions;

export default noteSlice.reducer;
