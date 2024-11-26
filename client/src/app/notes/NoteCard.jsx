import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { deleteNote } from "../../lib/fetchNotes";
import { marked } from "marked";
import { Link } from "react-router-dom";
BASE_URL = 'http://localhost:5000';

const NoteCard = ({ note, markers }) => {
  const [showFullNote, setShowFullNote] = useState(false);
  const [loading, setLoading] = useState(false);
  const { noteId } = useParams();
  const navigate = useNavigate();

  
  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteNote({ id: note._id });
      navigate("/notes");
    } catch (error) {
      console.error("Error deleting note", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notecard">
      <div
        className="note-preview"
        onClick={() => setShowFullNote(!showFullNote)}
        data-note-id={note._id}
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
          className="edit-button"
          onClick={(e) => {
            e.preventDefault();
            navigate(`/notes/${note._id}/edit`);
          }}
          aria-label={`Edit note ${note._id}`}
        >
          Edit
        </button>
        <br />
        <button
          className="delete-button"
          onClick={async (e) => {
            e.preventDefault();
            try {
              await axios.delete(`${BASE_URL}/notes/${note._id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              dispatch(deleteNote(note._id));
            } catch (error) {
              console.error("Error deleting note:", error);
            }
          }}
          aria-label={`Delete note ${note._id}`}
        >
          </button>
      </div>
    </div>
  );
};

export default NoteCard;
