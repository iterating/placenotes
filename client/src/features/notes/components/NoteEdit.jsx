import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import "./NoteEdit.css";
import NoteForm from "./NoteForm";
import { createNote, updateNote, deleteNote } from "../../../store/noteStoreAction";

const NoteEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const user = useSelector(state => state.auth.user);
  const existingNote = useSelector(state => id ? state.notes.notes.find(note => note._id === id) : null);
  
  const [note, setNote] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isEditMode = Boolean(id);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/users/login');
      return;
    }

    // For edit mode, load existing note
    if (isEditMode) {
      if (existingNote) {
        setNote(existingNote);
        setIsLoading(false);
      } else {
        setError("Note not found");
        setIsLoading(false);
      }
      return;
    }

    // For new note, initialize with default values and get location
    const initialNote = {
      body: "",
      location: {
        type: "Point",
        coordinates: [-118.243683, 34.052235] // Default to LA coordinates
      },
      radius: 1000,
      email: user.email,
      userId: user._id
    };

    setNote(initialNote);
    setIsLoading(false);
  }, [isAuthenticated, user, isEditMode, existingNote, navigate]);

  const handleSubmit = async (updatedNote) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (isEditMode) {
        await dispatch(updateNote(updatedNote));
      } else {
        await dispatch(createNote(updatedNote));
      }

      navigate('/notes');
    } catch (err) {
      setError(err.message || "Failed to save note");
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this note?")) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await dispatch(deleteNote(note._id));
      navigate('/notes');
    } catch (err) {
      setError(err.message || "Failed to delete note");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="edit-note-container">
        <div className="edit-note-form">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading note...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !note) {
    return (
      <div className="edit-note-container">
        <div className="edit-note-form">
          <div className="error-message">
            {error}
          </div>
          <button 
            className="button button-secondary"
            onClick={() => navigate('/notes')}
          >
            Back to Notes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-note-container">
      <div className="edit-note-form">
        <div className="edit-header">
          <h1 className="edit-title">
            {isEditMode ? 'Edit Note' : 'Create New Note'}
          </h1>
          <div className="edit-actions">
            {isEditMode && (
              <button
                className="button button-danger"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="loading-spinner" />
                    Deleting...
                  </>
                ) : (
                  'Delete Note'
                )}
              </button>
            )}
            <button
              className="button button-secondary"
              onClick={() => navigate('/notes')}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <NoteForm
          note={note}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default NoteEdit;
