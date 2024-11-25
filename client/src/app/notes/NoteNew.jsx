import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "./Notes.css"
import Mapmark from "./Mapmark"
import { useDispatch } from "react-redux";
import { createNote } from "../../store/noteStoreAction";

const NoteNew = () => {
  const currentLocation = JSON.parse(sessionStorage.getItem("currentLocation"))
  const coordinates = currentLocation
    ? currentLocation.coordinates
    : [-118.243683, 34.052235]

  const [body, setBody] = useState("")
  const [radius, setRadius] = useState(100)
  const [location, setLocation] = useState(() => {
    console.log("initial coordinates:", coordinates);
    return JSON.stringify({
      type: "Point",
      coordinates,
    })
  })

  const navigate = useNavigate()
  const dispatch = useDispatch();

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("submitting new note:", body, location, radius);
    const newNote = {
      body,
      location,
      radius,
    };

    console.log("new note:", newNote);
    dispatch(createNote({ token: sessionStorage.getItem("token"), note: newNote }));
    navigate("/notes");
  };

  const handleMapChange = (newNote) => {
    console.log("new note from map:", newNote);
    if (newNote && newNote.body && newNote.location && newNote.radius) {
      setBody(newNote.body);
      setLocation(JSON.stringify(newNote.location));
      setRadius(newNote.radius);
    }
  };

  return (
    <div className="edit-container">
      <h1 className="title">Create New Note</h1>
      <form onSubmit={handleSubmit} className="edit-note-form">
        <label htmlFor="note-body">Note:</label>
        <br />
        <textarea
          name="body"
          id="note-body"
          rows="8"
          cols="80"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        ></textarea>
        <br />
        <Mapmark
          note={{
            body,
            location: JSON.parse(location),
            radius,
          }}
          setNote={handleMapChange}
        />
        <input type="submit" value="Create Note" />
        <button type="button" onClick={() => navigate("/notes")}>
          Cancel
        </button>
      </form>
    </div>
  )
}

export default NoteNew

