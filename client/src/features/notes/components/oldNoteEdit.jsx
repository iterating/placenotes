import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import "./Notes.css";
import NoteForm from "./NoteForm";
import { updateNote, deleteNote } from "../../store/noteStoreAction";
import { selectNoteById } from "../../store/noteStoreSlice";

const NoteEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const originalNote = useSelector(state => selectNoteById(state, id));
  
  const [note, setNote] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (originalNote) {
      setNote(originalNote);
    }
  }, [originalNote]);

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

      const updatedNote = {
        ...note,
        body: note.body.trim(),
      };

      await dispatch(updateNote(updatedNote)).unwrap();
      navigate("/notes");
    } catch (error) {
      console.error("Error updating note:", error);
      setError(error.message || "Failed to update note. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        await dispatch(deleteNote(note._id)).unwrap();
        navigate("/notes");
      } catch (error) {
        setError(error.message || "Failed to delete note");
      }
    }
  };

  if (!note) return <div>Loading...</div>;

  return (
    <div>
      <NoteForm
        note={note}
        onNoteChange={setNote}
        onLocationChange={handleMapChange}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={error}
        submitLabel="Save Changes"
        title="Edit Note"
      />
      <div className="delete-container">
        <button onClick={handleDelete} className="delete-button">
          Delete Note
        </button>
      </div>
    </div>
  );
};

export default NoteEdit;
