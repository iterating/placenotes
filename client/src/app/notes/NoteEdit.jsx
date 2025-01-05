import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { deleteNote } from "../../store/noteStoreAction"
import { fetchOneNote, updateNote } from "../../lib/fetchNotes.js"
import Mapmark from "./Mapmark.jsx"
import { marked } from "marked"
import { getToken } from "../../lib/tokenManager"

const NoteEdit = () => {
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/users/login');
      return;
    }

    const token = getToken();
    if (!token) {
      setError(new Error("Authentication required. Please log in."));
      setLoading(false);
      navigate('/users/login');
      return;
    }

    if (!id) {
      setError(new Error("Note ID is required"));
      setLoading(false);
      return;
    }

    fetchOneNote(token, id)
      .then((data) => {
        setNote(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [id, isAuthenticated, navigate]);

  const handleSave = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No token available");
      }

      await updateNote(token, id, note);
      navigate("/notes");
    } catch (err) {
      setError(err);
    }
  };

  const handleChange = (e) => {
    setNote((prev) => ({
      ...prev,
      body: e.target.value,
    }));
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        const result = await dispatch(deleteNote({ id: id })).unwrap();
        if (result) {
          navigate("/notes");
        }
      } catch (error) {
        console.error("Error deleting note:", error);
        setError(error);
      }
    }
  };

  const handleMapChange = ([lng, lat]) => {
    setNote((prev) => ({
      ...prev,
      location: { type: "Point", coordinates: [lng, lat] },
    }))
  }

  if (loading) return <div className="edit-container"><p>Loading...</p></div>;
  if (error) return <div className="edit-container"><p>Error: {error.message}</p></div>;
  if (!note) return <div className="edit-container"><p>Note not found</p></div>;

  return (
    <div className="edit-container">
      <h1>Edit Note</h1>
      <textarea
        value={note.body || ""}
        onChange={handleChange}
        style={{
          minHeight: "300px",
          maxHeight: "100vh",
          height: "auto",
          overflow: "scroll",
        }}
      />

      <div className="button-group">
        <button onClick={handleSave}>Save Changes</button>
        <button onClick={() => navigate("/notes")}>
          Go Back Without Saving
        </button>
        <button onClick={handleDelete}>Delete Note</button>
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
  );
};

export default NoteEdit;
