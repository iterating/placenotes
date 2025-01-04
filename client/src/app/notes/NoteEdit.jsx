import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useDispatch } from "react-redux"
import { deleteNote } from "../../store/noteStoreAction"
import { fetchOneNote, updateNote } from "../../lib/fetchNotes.js"
import Mapmark from "./Mapmark.jsx"
import { marked } from "marked"

const NoteEdit = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { id } = useParams()
  const token = sessionStorage.getItem("token")
  const [note, setNote] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNote = async () => {
      if (!id) {
        setError(new Error("Note ID is required"))
        setLoading(false)
        return
      }

      try {
        const fetchedNote = await fetchOneNote(token, id)
        if (!fetchedNote || !fetchedNote._id) {
          throw new Error("Note not found")
        }
        setNote(fetchedNote)
      } catch (err) {
        setError(err)
        console.error("Error fetching note:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchNote()
  }, [token, id])

  const handleSave = async () => {
    if (!id || !note) {
      setError(new Error("Note data is missing"))
      return
    }

    try {
      const updatedNote = await updateNote(token, id, note)
      if (!updatedNote || !updatedNote._id) {
        throw new Error("Failed to update note")
      }
      setNote(updatedNote) // Update state with the latest data
      navigate(`/notes/`)
    } catch (err) {
      setError(err)
      console.error("Error updating note:", err)
    }
  }

  const handleMapChange = ([lng, lat]) => {
    setNote((prev) => ({
      ...prev,
      location: { type: "Point", coordinates: [lng, lat] },
    }))
  }

  if (loading) return <div className="edit-container"><p>Loading...</p></div>
  if (error) return <div className="edit-container"><p>Error: {error.message}</p></div>
  if (!note) return <div className="edit-container"><p>Note not found</p></div>

  return (
    <div className="edit-container">
      <h1>Edit Note</h1>
      <textarea
        value={note.body || ""}
        onChange={(e) =>
          setNote((prev) => ({ ...prev, body: e.target.value }))
        }
        style={{ height: "400px" }}
      />

      <div className="button-group">
        <button onClick={handleSave}>Save Changes</button>
        <button onClick={() => navigate("/notes")}>
          Go Back Without Saving
        </button>
        <button
          onClick={() => {
            if (
              window.confirm("Are you sure you want to delete this note?")
            ) {
              dispatch(deleteNote({ id: note._id }))
                .unwrap()
                .then(() => navigate("/notes"))
                .catch(err => {
                  console.error("Error deleting note:", err)
                  setError(err)
                })
            }
          }}
        >
          Delete Note
        </button>
      </div>
      <Mapmark
        note={note}
        setNote={setNote}
        onMapChange={handleMapChange}
      />
      <div className="markdown-preview">
        <h4>Preview</h4>
        <div dangerouslySetInnerHTML={{ __html: marked(note.body || "") }} />
      </div>
    </div>
  )
}

export default NoteEdit
