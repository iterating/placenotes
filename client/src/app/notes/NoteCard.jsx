import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import noteSlice from "../../store/noteSlice";
import { marked } from "marked";
import { Link } from "react-router-dom";
const NoteCard = ({ note, markers }) => {
  const [showFullNote, setShowFullNote] = useState(false);
  const { noteId } = useParams();
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  return (
    <div>
      <div
        className="note-preview"
        onClick={() => setShowFullNote(!showFullNote)}
        data-note-id={note._id}
        
        onMouseOver={() => {
          const markerElement = markers.current.find((marker) => {
            const popupContent = marker.getPopup()?.getContent();
            return popupContent && popupContent.includes(`Edit Note`) && popupContent.includes(note._id);
          });
          if (markerElement) markerElement.openPopup();
        }}
        onMouseOut={() => {
          const markerElement = markers.current.find((marker) => {
            const popupContent = marker.getPopup()?.getContent();
            return popupContent && popupContent.includes(`Edit Note`) && popupContent.includes(note._id);
          });
          if (markerElement) markerElement.closePopup();
        }}
      >
        <div className="note-body"
          dangerouslySetInnerHTML={{
            __html: marked(showFullNote ? note.body : note.body.split('\n')[0]),
          }}
        />
      </div>
      <div className="note-actions-ui">
      <Link
  className="edit-button"
  to={`/notes/${note._id}/edit`}
  state={{ noteId: note._id, token }}
>
  Edit
</Link>
        <br/>
        <button
          className="delete-button"
          onClick={() => noteSlice.actions.deleteNote({ id: note._id })}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default NoteCard;


