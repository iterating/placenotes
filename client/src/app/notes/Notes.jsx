import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapWithMarkers } from "./MapWithMarkers";
import "./Notes.css";
import Note from "./Note";

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      console.log("Fetching token from local storage...");
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        console.log("Token found in local storage:", storedToken);
        setToken(storedToken);
      } else {
        console.log("No token found in local storage");
      }
    };
    fetchToken();
  }, []);

  useEffect(() => {
    const fetchNotes = async () => {
      console.log("Fetching notes from server...");
      if (!token) {
        console.error("Token is not yet available");
        return;
      }
      try {
        console.log("Fetching notes with token:", token);
        const response = await axios.get("http://localhost:5000/notes", {
          headers: {
            Authorization: token,
          },
        });
        if (!response || !response.data) {
          throw new Error("No response received from server");
        }
        console.log("Setting notes state to:", response.data.notes);
        setNotes(response.data.notes);
        setUser(response.data.user);
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    }
    if (token !== null) {
      fetchNotes();
    }
  }, [token]);

  if (!notes) {
    console.log("Notes not available yet, loading...");
    return <div>Loading...</div>;
  }

  if (!user) {
    console.log("User not logged in");
    return <div>You are not logged in.</div>;
  }

  console.log("Rendering notes for user:", user);
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

