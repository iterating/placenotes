import React, { useState } from "react";
import { useDispatch } from "react-redux";
import noteSlice from "../../store/noteSlice";
import { marked } from "marked";

const NoteEdit = ({ note, markers }) => {
  const [showFullNote, setShowFullNote] = useState(false);
  const dispatch = useDispatch();

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
        <div
          dangerouslySetInnerHTML={{
            __html: marked(showFullNote ? note.body : note.body.split('\n')[0]),
          }}
        />
      </div>
      <div className="note-actions-ui">
        <button
          className="edit-button"
          onClick={() => window.location.href = `/notes/${note._id}/edit`}
        >
          Edit
        </button>
        <br/>
        <button
          className="delete-button"
          onClick={() => dispatch(noteSlice.actions.deleteNote({ id: note._id }))}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default NoteEdit;

