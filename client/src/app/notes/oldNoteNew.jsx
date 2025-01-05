import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import "./Notes.css";
import NoteForm from "./NoteForm";
import { createNote } from "../../store/noteStoreAction";

const NoteNew = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const user = useSelector(state => state.auth.user);

  const [note, setNote] = useState({
    body: "",
    location: null,
    radius: 100
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/users/login');
      return;
    }

    // Get initial location
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
        },
        (error) => {
          console.error("Geolocation error:", error);
          setError("Could not get your location. Please enable location services.");
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setError("Geolocation is not supported by your browser");
    }
  }, [isAuthenticated, user, navigate]);

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

      if (!user?._id) {
        throw new Error("User information not available");
      }

      const noteData = {
        ...note,
        body: note.body.trim(),
        userId: user._id,
        email: user.email,
        time: new Date().toISOString(),
        type: "note",
        status: "active"
      };

      await dispatch(createNote(noteData)).unwrap();
      navigate("/notes");
    } catch (error) {
      console.error("Error creating note:", error);
      setError(error.message || "Failed to create note. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <NoteForm
      note={note}
      onNoteChange={setNote}
      onLocationChange={handleMapChange}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      error={error}
      submitLabel="Create Note"
      title="Create New Note"
    />
  );
};

export default NoteNew;
