import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "./Notes.css"
import Mapmark from "./Mapmark"

const NoteNew = () => {
  const currentLocation = JSON.parse(sessionStorage.getItem("currentLocation"))
  const [body, setBody] = useState("")
  const [radius, setRadius] = useState(100)
  const [note, setNote] = useState({
    body: "",
    location: { coordinates: [] },
    radius: 100,
    _id: "",
  })

  const [location, setLocation] = useState(() => {
    const coordinates = currentLocation
      ? currentLocation.coordinates
      : [-118.243683, 34.052235]
    return JSON.stringify({
      type: "Point",
      coordinates,
    })
  })

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = sessionStorage.getItem("token")
      const response = await axios.post(
        "http://localhost:5000/notes",
        { body, location: JSON.parse(location), radius },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      console.log("Note created:", response.data)
      navigate("/notes")
    } catch (error) {
      console.error("Error creating note:", error)
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
          rows="8"
          cols="80"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        ></textarea>
        <br />
        <Mapmark
          note={{
            ...note,
            location: JSON.parse(location),
            radius,
          }}
          setNote={setNote}
        />
        <input
          type="hidden"
          name="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          type="hidden"
          name="radius"
          value={radius}
          onChange={(e) => setRadius(e.target.valueAsNumber || 100)}
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

