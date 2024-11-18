import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapWithMarkers } from "./MapWithMarkers";
import "./Notes.css";
import Note from "./Note";

const Notes = () => {
  const [notes, setNotes] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await axios.get("http://localhost:5000/notes");
        setNotes(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchNotes();
  }, []);

  if (!notes || !user) {
    return <div>Loading...</div>;
  }

  console.log("User:", user);
  console.log("Notes:", notes);

  return (
    <div className="note-container">
      <h1 className="title">Your Notes</h1>
      <MapWithMarkers notes={notes} />
      {notes.length > 0 ? (
        notes.map(note => {
          console.log("Note:", note);
          if (note.userId && user && user._id && note.userId.toString() === user._id.toString()) {
            return (
              <React.Fragment key={note._id}>
                <div className="note" id={`note-${note._id}`}>
                  <Note note={note} />
                </div>
              </React.Fragment>
            );
          } else {
            console.log("Note is not from current user:", note);
            return null;
          }
        })
      ) : (
        <p>You don't have any notes yet.</p>
      )}
      <p><a href="/notes/new">Create a new note</a></p>
    </div>
  );
};

export default Notes;

