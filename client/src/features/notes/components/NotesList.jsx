import React from "react";
import NoteCard from "./NoteCard";

const NotesList = React.memo(({ notes = [], handleNoteClick, handleMouseOver, handleMouseOut, markers }) => {
  if (!Array.isArray(notes)) {
    console.warn('Notes prop is not an array:', notes);
    return <p>Error: Unable to display notes.</p>;
  }

  return (
    <div className="notes-list">
      {notes.length > 0 ? (
        notes.map((note) => (
          <NoteCard
            key={note._id}
            note={note}
            onClick={() => handleNoteClick(note._id)}
            onMouseOver={() => handleMouseOver(note._id)}
            onMouseOut={() => handleMouseOut(note._id)}
            markers={markers}
            style={{
              backgroundColor: note.showFullNote ? "#add8e6" : "",
            }}
          />
        ))
      ) : (
        <p>You don't have any notes yet.</p>
      )}
    </div>
  );
});

NotesList.displayName = 'NotesList';

export default NotesList;