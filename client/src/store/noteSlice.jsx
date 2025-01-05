import { createSlice } from '@reduxjs/toolkit';
import {
  fetchUsersNotes,
  fetchNotesByLocation,
  fetchOneNote,
  createNote,
  updateNote,
  deleteNote,
  SET_CURRENT_LOCATION
} from './noteStoreAction';

const initialState = {
  notes: [],
  currentNote: null,
  location: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const noteSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    clearNotes: (state) => {
      state.notes = [];
      state.currentNote = null;
      state.error = null;
      state.status = 'idle';
    },
    setNoteVisibility: (state, action) => {
      const { id, visible } = action.payload;
      const note = state.notes.find(n => n._id === id);
      if (note) {
        note.showFullNote = visible;
      }
    }
  },
  extraReducers: (builder) => {
    // Fetch all notes
    builder
      .addCase(fetchUsersNotes.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUsersNotes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.notes = action.payload;
      })
      .addCase(fetchUsersNotes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

    // Fetch notes by location
    builder
      .addCase(fetchNotesByLocation.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchNotesByLocation.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.notes = action.payload;
      })
      .addCase(fetchNotesByLocation.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

    // Fetch one note
    builder
      .addCase(fetchOneNote.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchOneNote.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentNote = action.payload;
      })
      .addCase(fetchOneNote.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

    // Create note
    builder
      .addCase(createNote.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.notes.push(action.payload);
      })
      .addCase(createNote.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

    // Update note
    builder
      .addCase(updateNote.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.notes.findIndex(note => note._id === action.payload._id);
        if (index !== -1) {
          state.notes[index] = action.payload;
        }
        if (state.currentNote?._id === action.payload._id) {
          state.currentNote = action.payload;
        }
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

    // Delete note
    builder
      .addCase(deleteNote.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.notes = state.notes.filter(note => note._id !== action.payload.id);
        if (state.currentNote?._id === action.payload.id) {
          state.currentNote = null;
        }
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

    // Set location
    builder
      .addCase(SET_CURRENT_LOCATION, (state, action) => {
        state.location = action.payload;
      });
  },
});

// Export actions
export const { clearNotes, setNoteVisibility } = noteSlice.actions;

// Selectors
export const selectAllNotes = (state) => state.notes.notes;
export const selectCurrentNote = (state) => state.notes.currentNote;
export const selectNoteStatus = (state) => state.notes.status;
export const selectNoteError = (state) => state.notes.error;
export const selectLocation = (state) => state.notes.location;

export default noteSlice.reducer;
