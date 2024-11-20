import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import Note from "./Note"



const NotesList = React.memo(({ notes, handleNoteClick, handleMouseOver, handleMouseOut, markers }) => {
  return (
    <div>
      {notes.length > 0 ? (
        notes.map((note) => (
          <Note
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

export default NotesList