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

  // Extract coordinates from note location
  const coordinates = note?.location?.coordinates 
    ? [note.location.coordinates[1], note.location.coordinates[0]] // Convert [lng, lat] to [lat, lng]
    : undefined;

  return (
    <div className="edit-note-form">
      <h1 style={{ textAlign: 'center' }}>{title}</h1>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="note-form">
        <div className="editor-container">
          <NoteTiptap
            content={note.body || ""}
            onUpdate={({ editor }) => {
              const markdown = editor.storage.markdown.getMarkdown();
              if (markdown !== note.body) {
                onNoteChange({ ...note, body: markdown });
              }
            }}
            editable={!isSubmitting}
          />
        </div>

        <div className="map-section">
          <div className="map-container">
            <Mapmark
              note={note}
              setNote={onNoteChange}
              onMapChange={handleMapChange}
              coordinates={coordinates}
            />
          </div>
          <div className="radius-control">
            <label htmlFor="radius-slider">Radius: {note.radius}m</label>
            <input
              id="radius-slider"
              type="range"
              min="10"
              max="10000"
              value={note.radius || 100}
              onChange={(e) => {
                const newRadius = e.target.valueAsNumber;
                onNoteChange({
                  ...note,
                  radius: newRadius
                });
              }}
              className="radius-slider"
            />
          </div>
        </div>

        <div className="button-group">
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="btn btn-primary"
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </button>
          <button 
            type="button" 
            onClick={() => navigate("/notes")} 
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default NoteForm;