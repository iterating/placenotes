import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapWithMarkers } from "./MapWithMarkers";
import "./Notes.css";
import Note from "./Note";

const Notes = () => {
  const [notes, setNotes] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(sessionStorage.token);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!token) {
        return;
      }
      try {
        const response = await axios.get("http://localhost:5000/notes", {
          headers: {
            Authorization: token,
          },
        });
        const { notes: fetchedNotes, user: fetchedUser } = response.data;
        setNotes(fetchedNotes);
        setUser(fetchedUser);
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    };
    if (token) {
      fetchNotes();
    }
  }, [token]);

  if (!notes || !user) {
    return <div>Loading...</div>;
  }

  console.log("Rendering notes for user:", user);
  return (
    <div className="note-container">
      <h1 className="title">Your Notes</h1>
      <MapWithMarkers notes={notes} />
      {notes.length > 0 ? (
        notes.map(note => {
          if (note.userId.toString() === user._id.toString()) {
            return (
              <React.Fragment key={note._id}>
                <div className="note" id={`note-${note._id}`}>
                  <Note note={note} />
                </div>
              </React.Fragment>
            );
          } else {
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


