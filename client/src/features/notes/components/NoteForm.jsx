import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NoteTiptap from "./NoteTiptap";
import Mapmark from "./Mapmark";
import "./Notes.css";
import "./NoteForm.css";

const NoteForm = ({ 
  note: initialNote, 
  onSubmit, 
  onDelete,
  isSubmitting 
}) => {
  const navigate = useNavigate();
  const [note, setNote] = useState(initialNote);
  const [error, setError] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    
    // Validate coordinates before submitting
    const coordinates = note?.location?.coordinates;
    if (!coordinates || 
        !Array.isArray(coordinates) || 
        coordinates.length !== 2 ||
        coordinates.some(coord => coord === null || coord === undefined || isNaN(coord))) {
      setError("Please select a valid location on the map");
      return;
    }
    
    if (!note.body?.trim()) {
      setError("Please enter some text for your note");
      return;
    }
    
    onSubmit(note);
  };

  const handleMapChange = (lng, lat) => {
    if (typeof lng === 'number' && typeof lat === 'number' && !isNaN(lng) && !isNaN(lat)) {
      setNote(prev => ({
        ...prev,
        location: {
          type: "Point",
          coordinates: [lng, lat]
        }
      }));
      setError(null);
    }
  };

  const handleRadiusChange = (radius) => {
    setNote(prev => ({
      ...prev,
      radius: radius
    }));
  };

  const handleContentChange = (newContent) => {
    setNote(prev => ({
      ...prev,
      body: newContent
    }));
    setError(null);
  };

  return (
    <div className="edit-note-form">
      <h1 className="form-title">
        {initialNote?._id ? 'Edit Note' : 'Create New Note'}
      </h1>
      <form onSubmit={handleSubmit} className="note-form">
        {error && <div className="error-message">{error}</div>}
        <div className="editor-container">
          <NoteTiptap
            content={note?.body || ""}
            onUpdate={handleContentChange}
          />
        </div>
        <div className="map-container">
          <Mapmark
            location={note?.location}
            onLocationChange={handleMapChange}
            onRadiusChange={handleRadiusChange}
            radius={note?.radius}
          />
        </div>
        <div className="radius-slider-container">
          <label htmlFor="radius">Radius:</label>
          <input
            type="range"
            id="radius"
            min="50"
            max="5000"
            step="50"
            value={note?.radius || 100}
            onChange={(e) => handleRadiusChange(Number(e.target.value))}
            className="radius-slider"
          />
          <span className="radius-value">{note?.radius || 100}m</span>
        </div>
        <div className="button-group">
          <button 
            type="button" 
            onClick={() => navigate("/notes")} 
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="btn btn-primary"
          >
            {isSubmitting ? "Saving..." : (initialNote?._id ? "Save Changes" : "Create Note")}
          </button>
        </div>
      </form>
      {initialNote?._id && (
        <div className="delete-container">
          <button 
            onClick={onDelete} 
            className="btn btn-danger"
            disabled={isSubmitting}
          >
            Delete Note
          </button>
        </div>
      )}
    </div>
  );
};

export default NoteForm;