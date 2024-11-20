import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Notes.css";
import Note from "./Note";
import { marked } from "marked";
import MapWithMarkers from "./MapWithMarkers.jsx"
import fetchNotes from "./FetchNotes";

const Notes = () => {
  const [notes, setNotes] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem("token"));
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    console.log("Notes component mounted");
    fetchNotes(token, setNotes, setUserId);
    if (token) {
      console.log("Fetching notes...");
      fetchNotes();
    }
  }, [token]);

  const handleNoteClick = (id) => {
    setNotes(notes.map(note =>
      note._id === id
        ? { ...note, showFullNote: !note.showFullNote }
        : note
    ));
  };

  console.log("Notes:", notes);
  console.log("User:", userId);
  return (
    <div className="note-container">
      <h1 className="title">Your Notes</h1>
      {/* <MapWithMarkers notes={notes} /> */}
      {notes && notes.length > 0 ? (
        notes.map((note) =>
          userId === note.userId ? (
            <React.Fragment key={note._id}>
              <div className="note" id={`note-${note._id}`} onClick={() => handleNoteClick(note._id)}>
                <div className="note-title" dangerouslySetInnerHTML={{ __html: note.body.split("\n")[0] }} />
                {note.showFullNote && (
                  <div className="note-body" dangerouslySetInnerHTML={{ __html: note.body }} />
                )}
              </div>
            </React.Fragment>
          ) : null
        )
      ) : (
        <p>You don't have any notes yet.</p>
      )}
      <p><a href="/notes/new">Create a new note</a></p>
    </div>
  );

};

export default Notes;


