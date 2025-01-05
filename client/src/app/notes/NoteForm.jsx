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
    onSubmit(event);
  };

  // Extract coordinates from note location
  const coordinates = note?.location?.coordinates 
    ? [note.location.coordinates[1], note.location.coordinates[0]] // Convert [lng, lat] to [lat, lng]
    : undefined;

  return (
    <div className="note-edit-content">
      <div className="note-header">
        <h1>{title}</h1>
        {error && <div className="error-message">{error}</div>}
      </div>
      <form onSubmit={handleSubmit} className="note-form">
        <div className="editor-container">
          <NoteTiptap
            content={note.body || ""}
            onUpdate={({ editor }) => {
              const html = editor.getHTML();
              if (html !== note.body) {
                onNoteChange({ ...note, body: html });
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
              onMapChange={onLocationChange}
              coordinates={coordinates}
            />
          </div>

          <div className="button-group">
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="primary-button"
            >
              {isSubmitting ? "Saving..." : submitLabel}
            </button>
            <button 
              type="button" 
              onClick={() => navigate("/notes")} 
              className="secondary-button"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NoteForm;
