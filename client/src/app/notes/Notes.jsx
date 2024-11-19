import React, { useState, useEffect } from "react";
import axios from "axios";
// import Mapmark from "./Mapmark";
import "./Notes.css";
import Note from "./Note";
import { marked } from "marked";

const Notes = () => {
  const [notes, setNotes] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem("token"));
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    console.log("Notes component mounted");
    const fetchNotes = async () => {
      if (!token) {
        console.log("No token found, skipping API call");
        return;
      }
      console.log("Fetching notes from server...");
      try {
        const response = await axios.get("http://localhost:5000/notes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const { data } = response;
        console.log("Received notes from server:", data);
        setNotes(data.map(note => ({
          ...note,
          body: marked(note.body),
          showFullNote: false
        })));
        setUserId(data[0].userId);
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    };
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
      {/* <Mapmark notes={notes} /> */}
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

