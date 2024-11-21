import React from "react";
import { connect } from "react-redux";
import  noteSlice  from "../../store/noteSlice"
import {marked} from "marked"

const deleteNote = (id) => noteSlice.actions.deleteNote({ id });

const Note = ({ note, markers, onDelete }) => {
  const [showFullNote, setShowFullNote] = React.useState(false);

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
        <form action={`/notes/${note._id}/edit`} method="GET" className="button">
          <button className="edit-button" type="submit">Edit</button>
        </form>
        <br/>
        <button className="delete-button" onClick={() => onDelete(note._id)}>Delete</button>
      </div>
    </div>
  );
};

const mapDispatchToProps = {
  onDelete: deleteNote,
};

export default connect(null, mapDispatchToProps)(Note);
