import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import "./Notes.css";
import NoteForm from "./NoteForm";
import { createNote, updateNote, deleteNote } from "../../store/noteStoreAction";

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
      location: null,
      radius: 100
    };
    setNote(initialNote);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNote(prev => ({
            ...prev,
            location: {
              type: "Point",
              coordinates: [position.coords.longitude, position.coords.latitude],
            }
          }));
          setIsLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setError("Could not get your location. Please enable location services.");
          setIsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setError("Geolocation is not supported by your browser");
      setIsLoading(false);
    }
  }, [isAuthenticated, user, navigate, isEditMode, existingNote]);

  const handleMapChange = (lat, lng) => {
    setNote(prev => ({
      ...prev,
      location: {
        type: "Point",
        coordinates: [lng, lat],
      }
    }));
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!note.location?.coordinates || !Array.isArray(note.location.coordinates) || note.location.coordinates.length !== 2) {
        throw new Error("Please select a valid location on the map");
      }

      if (!note.body.trim()) {
        throw new Error("Please enter a note");
      }

      if (!user?._id && !isEditMode) {
        throw new Error("User information not available");
      }

      if (isEditMode) {
        await dispatch(updateNote({
          ...note,
          body: note.body.trim(),
        })).unwrap();
      } else {
        await dispatch(createNote({
          ...note,
          body: note.body.trim(),
          userId: user._id,
          email: user.email,
          time: new Date().toISOString(),
          type: "note",
          status: "active"
        })).unwrap();
      }
      
      navigate("/notes");
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} note:`, error);
      setError(error.message || `Failed to ${isEditMode ? 'update' : 'create'} note. Please try again.`);
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditMode) return;
    
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        await dispatch(deleteNote(note._id)).unwrap();
        navigate("/notes");
      } catch (error) {
        setError(error.message || "Failed to delete note");
      }
    }
  };

  if (!isAuthenticated || !user) return null;
  if (isLoading) return <div className="loading">Loading...</div>;
  if (!note) return <div className="error-message">Note not found</div>;

  return (
    <div>
      <NoteForm
        note={note}
        onNoteChange={setNote}
        onLocationChange={handleMapChange}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={error}
        submitLabel={isEditMode ? "Save Changes" : "Create Note"}
        title={isEditMode ? "Edit Note" : "Create New Note"}
      />
      {isEditMode && (
        <div className="delete-container">
          <button onClick={handleDelete} className="delete-button">
            Delete Note
          </button>
        </div>
      )}
    </div>
  );
};

export default NoteEdit;
