import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapWithMarkers } from "./MapWithMarkers";
import "./Notes.css";
import Note from "./Note";

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  console.log("Notes component props:", { notes, user, token });

  useEffect(() => {
    const fetchNotes = async () => {
      console.log("Fetching notes from server...");
      if (!token) {
        console.error("Token is not yet available");
        return;
      }
      try {
        console.log("Fetching user with token:", token);
        const response = await axios.post("http://localhost:5000/users/login", {
          method: 'POST',
        });
        setToken(response.data.token); // Assign the token value within the try block
        console.log("New Token:", token);

        const notesResponse = await axios.get("http://localhost:5000/notes", {
          headers: {
            Authorization: token,
          },
        });
        console.log("Notes response:", notesResponse);
        if (!notesResponse || !notesResponse.data) {
          throw new Error("No notes received from server");
        }
        console.log("Setting notes state to:", notesResponse.data);
        setNotes(notesResponse.data);
        setUser(response.data.user);
      } catch (error) {
        console.error(error);
        throw error;
      }
      console.log("Notes received from server:", notesResponse.request.res.responseUrl);
    }
    if (token !== null) {
      fetchNotes();
  }
}, [token]);
console.log("Notes state:", notes);
if (!notes) {
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

