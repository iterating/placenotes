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
        coordinates: [-118.243683, 34.052235] // Default to LA coordinates [longitude, latitude]
      },
      radius: 1000,
      email: user.email
    };
    setNote(initialNote);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNote(prev => ({
            ...prev,
            location: {
              type: "Point",
              coordinates: [position.coords.longitude, position.coords.latitude]
            }
          }));
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoading(false);
        }
      );
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, isEditMode, existingNote, navigate]);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const noteData = {
        ...formData,
        email: user.email
      };

      if (isEditMode) {
        await dispatch(updateNote({ id, noteData })).unwrap();
      } else {
        await dispatch(createNote(noteData)).unwrap();
      }

      navigate('/notes');
    } catch (err) {
      console.error('Error saving note:', err);
      setError(err.message || 'Error saving note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await dispatch(deleteNote(id)).unwrap();
      navigate('/notes');
    } catch (err) {
      console.error('Error deleting note:', err);
      setError(err.message || 'Error deleting note');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="note-edit">
      <NoteForm
        note={note}
        onSubmit={handleSubmit}
        onDelete={isEditMode ? handleDelete : undefined}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default NoteEdit;
