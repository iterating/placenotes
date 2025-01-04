import { createSlice } from '@reduxjs/toolkit';
import { fetchUsersNotes, fetchOneNote, editNote, deleteNote } from "./noteStoreAction";

const initialState = {
  notes: {},
  loading: false,
  error: null,
};

const noteSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setNotes: (state, action) => {
      state.loading = false;
      state.notes = action.payload.reduce((acc, note) => {
        acc[note._id] = note;
        return acc;
      }, {});
    },
    clearNotes(state) {
      state.notes = {};
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Handle fetchUsersNotes
    builder.addCase(fetchUsersNotes.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUsersNotes.fulfilled, (state, action) => {
      state.loading = false;
      state.notes = action.payload.reduce((acc, note) => {
        acc[note._id] = note;
        return acc;
      }, {});
    });
    builder.addCase(fetchUsersNotes.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Handle fetchOneNote
    builder.addCase(fetchOneNote.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOneNote.fulfilled, (state, action) => {
      state.loading = false;
      state.notes[action.payload._id] = action.payload;
    });
    builder.addCase(fetchOneNote.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Handle editNote
    builder.addCase(editNote.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(editNote.fulfilled, (state, action) => {
      state.loading = false;
      state.notes[action.payload._id] = action.payload;
    });
    builder.addCase(editNote.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Handle deleteNote
    builder.addCase(deleteNote.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteNote.fulfilled, (state, action) => {
      state.loading = false;
      delete state.notes[action.payload];
    });
    builder.addCase(deleteNote.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Handle login success from auth slice
    builder.addCase('auth/loginSuccess', (state, action) => {
      if (action.payload.notes) {
        state.notes = action.payload.notes.reduce((acc, note) => {
          acc[note._id] = note;
          return acc;
        }, {});
      }
    });

    // Handle logout from auth slice
    builder.addCase('auth/logout', (state) => {
      state.notes = {};
      state.loading = false;
      state.error = null;
    });
  }
});

export const { setNotes, clearNotes } = noteSlice.actions;

// Selectors
export const selectAllNotes = (state) => Object.values(state.notes);
export const selectNoteById = (state, id) => state.notes[id];
export const selectNotesLoading = (state) => state.loading;
export const selectNotesError = (state) => state.error;

export default noteSlice.reducer;
