import React from "react";
import { MapWithMarkers } from "./MapwithMarkers";
import "./Notes.css";
import Note from "./Note";

const Notes = ({ notes, user }) => {
  if (!notes) return <div>Loading...</div>;

  return (
    <div className="note-container">
      <h1 className="title">Your Notes</h1>
      <MapWithMarkers notes={notes} />
      {notes.length > 0 ? (
        notes.map(note => (
          <React.Fragment key={note._id}>
            {note.userId && user && user._id && note.userId.toString() === user._id.toString() && (
              <div className="note" id={`note-${note._id}`}>
                <Note note={note} />
              </div>
            )}
          </React.Fragment>
        ))
      ) : (
        <p>You don't have any notes yet.</p>
      )}
      <p><a href="/notes/new">Create a new note</a></p>
    </div>
  );
};

export default Notes;