import React from "react";
import { useNavigate } from "react-router-dom";
import NoteTiptap from "./NoteTiptap";
import Mapmark from "./Mapmark";
import "./Notes.css";

const NoteForm = ({ 
  note, 
  onNoteChange, 
  onLocationChange,
  onSubmit, 
  isSubmitting, 
  error,
  submitLabel = "Save",
  title
}) => {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    
    // Validate coordinates before submitting
    const coordinates = note?.location?.coordinates;
    if (!coordinates || 
        !Array.isArray(coordinates) || 
        coordinates.length !== 2 ||
        coordinates.some(coord => coord === null || coord === undefined || isNaN(coord))) {
      // If coordinates are invalid, use a default location or show error
      const defaultCoords = [-118.243685, 34.052236]; // Default to LA
      onNoteChange({
        ...note,
        location: {
          type: "Point",
          coordinates: defaultCoords
        }
      });
    }
    
    onSubmit(event);
  };

  const handleMapChange = (lng, lat) => {
    if (typeof lng === 'number' && typeof lat === 'number' && !isNaN(lng) && !isNaN(lat)) {
      onNoteChange({
        ...note,
        location: {
          type: "Point",
          coordinates: [lng, lat]
        }
      });
    }
  };

  const handleRadiusChange = (radius) => {
    onNoteChange({
      ...note,
      radius: radius
    });
  };

  // Extract coordinates from note location
  const coordinates = note?.location?.coordinates 
    ? [note.location.coordinates[1], note.location.coordinates[0]] // Convert [lng, lat] to [lat, lng]
    : undefined;

  return (
    <div className="edit-note-form">
      <h1 style={{ textAlign: 'center' }}>{title}</h1>
      <form onSubmit={handleSubmit} className="note-form">
        {error && <div className="error-message">{error}</div>}
        <div className="editor-container">
          <NoteTiptap
            content={note?.body || ""}
            onUpdate={(newContent) => {
              onNoteChange({
                ...note,
                body: newContent
              });
            }}
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
            {isSubmitting ? "Saving..." : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NoteForm;