import { createSlice } from '@reduxjs/toolkit';
import {
  fetchUsersNotes,
  fetchNotesByLocation,
  createNote,
  updateNote,
  deleteNote,
  setCurrentLocation
} from './noteStoreAction';

const initialState = {
  notes: [],
  currentNote: null,
  location: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  isMapExpanded: true,
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
    },
    setLocation: (state, action) => {
      state.location = action.payload;
    },
    toggleMapExpanded: (state) => {
      state.isMapExpanded = !state.isMapExpanded;
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

      // Create note
      .addCase(createNote.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.notes.unshift(action.payload);
      })
      .addCase(createNote.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Update note
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
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Delete note
      .addCase(deleteNote.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.notes = state.notes.filter(note => note._id !== action.payload);
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

// Export actions
export const { 
  clearNotes, 
  setNoteVisibility, 
  setLocation, 
  toggleMapExpanded 
} = noteSlice.actions;

// Selectors
export const selectAllNotes = (state) => state.notes.notes;
export const selectCurrentNote = (state) => state.notes.currentNote;
export const selectNoteStatus = (state) => state.notes.status;
export const selectNoteError = (state) => state.notes.error;
export const selectLocation = (state) => state.notes.location;

export default noteSlice.reducer;
