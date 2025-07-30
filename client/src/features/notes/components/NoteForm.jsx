import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NoteCodemirror from "./NoteCodemirror";
import Mapmark from "./Mapmark";
import "./Notes.css";
import "./NoteForm.css";

const NoteForm = ({ 
  note, 
  onNoteChange,
  onSubmit, 
  onDelete,
  isSubmitting 
}) => {
  const navigate = useNavigate();
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
    
    onSubmit();
  };

  const handleFieldChange = (fieldName, value) => {
    onNoteChange({ ...note, [fieldName]: value });
  };

  const handleLocationChange = (lng, lat) => {
    if (typeof lng === 'number' && typeof lat === 'number' && !isNaN(lng) && !isNaN(lat)) {
      handleFieldChange('location', { type: 'Point', coordinates: [lng, lat] });
      setError(null);
    }
  };



  return (
    <>
      <form onSubmit={handleSubmit} className="note-form">
        {error && <div className="error-message">{error}</div>}
        <div className="editor-container">
          <NoteCodemirror
            content={note?.body || ""}
            onUpdate={(body) => handleFieldChange('body', body)}
          />
        </div>
        <div className="note-form-map">
          <Mapmark
            location={note?.location}
            onLocationChange={handleLocationChange}
            onRadiusChange={(radius) => handleFieldChange('radius', radius)}
            radius={note?.radius}
          />
        </div>
        
        {/* Fixed action bar for always-visible controls */}
        <div className="note-form-actions">
          <div className="radius-slider-container">
            <label htmlFor="radius">Radius:</label>
            <input
              type="range"
              id="radius"
              min="50"
              max="5000"
              step="50"
              value={note?.radius || 100}
              onChange={(e) => handleFieldChange('radius', Number(e.target.value))}
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
              {isSubmitting ? "Saving..." : (note?._id ? "Save Changes" : "Create Note")}
            </button>
          </div>
        </div>
      </form>
      {note?._id && (
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
    </>
  );
};

export default NoteForm;