import Note from "./Note";
import "./Notes.css";
import React from "react";
import { marked } from "marked";
import "leaflet/dist/leaflet.css";

const NotesList = ({ notes, handleNoteClick }) => {
    return (
      <div>
        {notes.length > 0 ? (
          notes.map((note) => (
            <Note
              key={note._id}
              note={note}
              onClick={() => handleNoteClick(note._id)}
            />
          ))
        ) : (
          <p>You don't have any notes yet.</p>
        )}
      </div>
    )
  }

  export default NotesList