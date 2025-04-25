import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { deleteNote } from "../store/noteThunks";
import { marked } from "marked";
import "./NoteCard.css";
import "./ToggleBar.css";

const NoteCard = ({ note, markers }) => {
  const [showFullNote, setShowFullNote] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const noteScrollRef = React.useRef(null);

  // Configure marked options to prevent excessive HTML elements
  useEffect(() => {
    marked.setOptions({
      gfm: true,
      breaks: true,
      headerIds: false,
      mangle: false,
      smartLists: true
    });
  }, []);

  const handleToggle = () => {
    if (noteScrollRef.current) {
      const rect = noteScrollRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const noteTop = rect.top + scrollTop;

      setShowFullNote(!showFullNote);

      // Only scroll if we're expanding and the note is not fully visible
      if (!showFullNote && rect.top < 0) {
        requestAnimationFrame(() => {
          window.scrollTo({
            top: noteTop,
            behavior: 'smooth'
          });
        });
      }
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      await dispatch(deleteNote(note._id)).unwrap();
      navigate("/notes");
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  return (
    <div className="notecard bg-white rounded-md shadow-md border border-gray-200" ref={noteScrollRef}>
      <div className="toggle-bar cursor-pointer flex justify-center items-center p-xs" onClick={handleToggle}>
        <div className="toggle-handle flex items-center gap-sm">
          <span className="toggle-icon">{showFullNote ? '▼' : '▲'}</span>
          <span className="toggle-text text-sm">{showFullNote ? 'Minimize Note' : 'Expand Note'}</span>
        </div>
      </div>
      <div
        className={`note-preview p-md ${showFullNote ? 'expanded' : ''}`}
        data-note-id={note._id}
        onClick={handleToggle}
        onMouseOver={() => {
          const markerElement = markers.current.find((marker) => {
            const popupContent = marker.getPopup()?.getContent();
            return (
              popupContent &&
              popupContent.includes(`Edit Note`) &&
              popupContent.includes(note._id)
            );
          });
          if (markerElement) markerElement.openPopup();
        }}
        onMouseOut={() => {
          const markerElement = markers.current.find((marker) => {
            const popupContent = marker.getPopup()?.getContent();
            return (
              popupContent &&
              popupContent.includes(`Edit Note`) &&
              popupContent.includes(note._id)
            );
          });
          if (markerElement) markerElement.closePopup();
        }}
      >
        <div
          className="note-body prose"
          dangerouslySetInnerHTML={{
            __html: marked(
              // Clean and sanitize the note text to prevent unwanted elements
              (showFullNote ? note.body : note.body.split("\n")[0])
                .replace(/\n\s*\n/g, '\n') // Replace double line breaks with single
                .replace(/\/\s*$/g, '') // Remove trailing slashes
            ),
          }}
        />
      </div>
      <div className="note-actions-ui flex gap-md p-md border-t border-gray-200">
        <button 
          className="btn btn-primary"
          onClick={(e) => {
            e.preventDefault();
            navigate(`/notes/${note._id}/edit`);
          }}
          aria-label={`Edit note ${note._id}`}
        >
          Edit
        </button>
        <button
          className="btn btn-outline-danger"
          onClick={handleDelete}
          aria-label={`Delete note ${note._id}`}
        >
          Delete Note
        </button>
      </div>
    </div>
  );
};

export default NoteCard;
