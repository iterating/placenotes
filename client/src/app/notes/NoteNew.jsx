import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "./Notes.css"
import Mapmark from "./Mapmark"
import { useDispatch } from "react-redux"
import { createNote } from "../../store/noteStoreAction"
// BASE_URL = 'http://API_URL';

const NoteNew = () => {
  const [coordinates, setCoordinates] = useState([])
  const [body, setBody] = useState("")
  const [radius, setRadius] = useState(100)
  const [location, setLocation] = useState({ type: "Point", coordinates: [] })

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const tokenPayload = JSON.parse(
    atob(sessionStorage.getItem("token").split(".")[1])
  )
  const userId = tokenPayload._id
  const email = tokenPayload.email

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates([position.coords.longitude, position.coords.latitude])
      },
      (error) => console.error("Geolocation error:", error),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    )
  }, [])

  const handleMapChange = (lng, lat) => {
    setCoordinates([lng, lat])
    setLocation({ type: "Point", coordinates: [lng, lat] })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    console.log("submitting new note:", body, location, radius)

    const newNote = {
      userId,
      email,
      location: {
        type: "Point",
        coordinates: coordinates,
      },
      radius,
      time: Date.now(),
      body,
      recipients: [],
      type: "note",
      status: "active",
    }

    axios
      .post("http://localhost:5000/notes/new", newNote)
      .then((response) => {
        console.log("Note created:", response.data)
        navigate("/notes")
      })
      .catch((error) => {
        console.error("Error creating note:", error)
      })
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
          coordinates={coordinates}
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
