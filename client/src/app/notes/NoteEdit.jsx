import React, { useState, useEffect, useCallback } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { useDispatch } from "react-redux"
import { deleteNote } from "../../store/noteStoreAction"
import NoteTiptap from "./NoteTiptap"
import { fetchOneNote, updateNote } from "../../lib/fetchNotes.js"
import Mapmark from "./Mapmark.jsx"

const NoteEdit = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { noteId } = useParams()
  const token = sessionStorage.getItem("token")
  console.log("NoteEdit: Received token:", token)
  const [note, setNote] = useState(null)
  console.log("NoteEdit: Initializing note:", note)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNote = async () => {
      try {
        console.log("Fetching note:", noteId)
        const fetchedNote = await fetchOneNote(token, noteId)
        console.log("Fetched note:", fetchedNote)
        setNote(fetchedNote)
      } catch (err) {
        setError(err)
        console.error("Error fetching note:", err)
      } finally {
        setLoading(false)
      }
    }

    console.log("Fetching note")
    fetchNote()
  }, [token, noteId])

  const handleMapChange = (lng, lat) => {
    setNote((prev) => ({
      ...prev,
      location: { type: "Point", coordinates: [lng, lat] },
    }))
  }

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault()
      try {
        console.log("Saving changes:", note)
        const updatedNote = await updateNote(token, noteId, note)
        console.log("Updated note:", updatedNote)
        navigate(`/notes/`)
      } catch (err) {
        setError(err)
        console.error("Error submitting form:", err)
      }
    },
    [dispatch, token, noteId, navigate, note]
  )

  return (
    <>
      <div className="edit-container">
        <h1>Edit Note</h1>
        {note && <NoteTiptap note={note} setNote={setNote} />}
        {note && (
          <Mapmark
            note={note}
            setNote={setNote}
            onMapChange={handleMapChange}
          />
        )}
        <form onSubmit={handleSubmit}>
          <button type="submit">Save Changes</button>
        </form>
        {loading && <p>Loading...</p>}
        {error && <p>Error: {error.message}</p>}
        <button
          onClick={() => {
            if (window.confirm("Are you sure you want to delete this note?")) {
              dispatch(deleteNote({ id: note._id, token }))
                .unwrap()
                .then(() => navigate("/notes"))
            }
          }}
        >
          Delete Note
        </button>
      </div>
    </>
  )
}

export default NoteEdit

