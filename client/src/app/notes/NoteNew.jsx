import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "./Notes.css"
import Mapmark from "./Mapmark"
import { useDispatch } from "react-redux"
import { createNote, deleteNote } from "../../store/noteStoreAction"

const NoteNew = () => {
  const [token, setToken] = useState(sessionStorage.getItem("token"));
  const tokenPayload = JSON.parse(atob(token.split(".")[1]));
  const userId = tokenPayload._id;
  const email = tokenPayload.email;
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [body, setBody] = useState("")
  const [radius, setRadius] = useState(100)
  const [location, setLocation] = useState(null)
  const [note, setNote] = useState({})

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          type: "Point",
          coordinates: [position.coords.longitude, position.coords.latitude],
        })
      },
      (error) => console.error("Geolocation error:", error),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    )
  }, [])

  useEffect(() => {
    if (location) return
    navigator.geolocation.getCurrentPosition(
      (position) =>
        setLocation({
          type: "Point",
          coordinates: [position.coords.longitude, position.coords.latitude],
        }),
      (error) => console.error("Geolocation error:", error),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    )
  }, [location])

  const handleMapChange = (lat, lng) => {
    setLocation({
      type: "Point",
      coordinates: [lng, lat],
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    console.log("submitting new note:", body, location, radius)

    if (
      location &&
      location.type === "Point" &&
      Array.isArray(location.coordinates) &&
      location.coordinates.length === 2
    ) {
      const newNote = {
        userId,
        email,
        location,
        radius,
        time: Date.now(),
        body,
        recipients: [],
        type: "note",
        status: "active",
      }

      dispatch(createNote({ note: newNote }))
        .unwrap()
        .then(() => {
          navigate("/notes")
        })
        .catch((error) => {
          console.error("Error creating note:", error)
        })
    } else {
      console.error("Invalid location:", location)
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
          setNote={setNote}
          onMapChange={handleMapChange}
          coordinates={location?.coordinates}
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

