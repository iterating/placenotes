import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "./Notes.css"
import Mapmark from "./Mapmark"
import { useDispatch } from "react-redux"
import { createNote } from "../../store/noteStoreAction"
// BASE_URL = 'http://API_URL';

const NoteNew = () => {
  const currentLocation = JSON.parse(sessionStorage.getItem("currentLocation"))
  const coordinates = currentLocation
    ? currentLocation.coordinates
    : [-118.243683, 34.052235]

  const [body, setBody] = useState("")
  const [radius, setRadius] = useState(100)
  const [location, setLocation] = useState(() => {
    console.log("initial coordinates:", coordinates)
    return {
      type: "Point",
      coordinates,
    }
  })

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const tokenPayload = JSON.parse(atob(sessionStorage.getItem("token").split(".")[1]))
  const userId = tokenPayload._id
  const email = tokenPayload.email
  console.log("email:", email)
  console.log("userId:", userId)

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("submitting new note:", body, location, radius);
  
    const newNote = {
      body,
      location,
      radius,
      recipients: [],
      time: Date.now(),
      userId, 
      email,  
    };
  
    axios.post('http://API_URL/notes/new', newNote)
    .then(response => {
      console.log("Note created:", response.data);
      navigate("/notes");
    })
    .catch(error => {
      console.error("Error creating note:", error);
    });
  };
  

  const handleMapChange = (newNote) => {
    console.log("new note from map:", newNote)
    if (newNote && newNote.body && newNote.location && newNote.radius) {
      console.log("updating new note:", newNote)
      setBody(newNote.body)
      setLocation(newNote.location)
      setRadius(newNote.radius)
    }
  }

  return (
    <div className="edit-container">
      <h1 className="title">Create New Note</h1>
      <form onSubmit={handleSubmit} className="edit-note-form">
        <label htmlFor="note-body">Note:</label>
        <br />
        <textarea
          name="body"
          id="note-body"
          rows="20"
          cols="80"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        ></textarea>
        <br />
        <Mapmark
          note={{
            body,
            location,
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

