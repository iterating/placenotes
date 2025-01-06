import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { deleteNote } from "../../../store/noteStoreAction";
import { marked } from "marked";
import "./NoteCard.css";
import "./ToggleBar.css";

const NoteCard = ({ note, markers }) => {
  const [showFullNote, setShowFullNote] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const noteScrollRef = React.useRef(null);

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
    try {
      const result = await dispatch(deleteNote({ id: note._id })).unwrap();
      if (result) {
        navigate("/notes");
      }
    } catch (error) {
      console.error("Error deleting note", error);
    }
  };

  return (
    <div className="notecard" ref={noteScrollRef}>
      <div className="toggle-bar" onClick={handleToggle}>
        <div className="toggle-handle">
          <span className="toggle-icon">{showFullNote ? '▼' : '▲'}</span>
          <span className="toggle-text">{showFullNote ? 'Minimize Note' : 'Expand Note'}</span>
        </div>
      </div>
      <div
        className={`note-preview ${showFullNote ? 'expanded' : ''}`}
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
          className="note-body"
          dangerouslySetInnerHTML={{
            __html: marked(showFullNote ? note.body : note.body.split("\n")[0]),
          }}
        />
      </div>
      <div className="note-actions-ui">
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
