import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { deleteNote } from "../../store/noteStoreAction";
import { fetchOneNote, updateNote } from "../../lib/fetchNotes.js";
import Mapmark from "./Mapmark.jsx";
import { marked } from "marked";

import "@mdxeditor/editor/style.css";

const NoteEdit = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { noteId } = useParams();
  const token = sessionStorage.getItem("token");
  const [note, setNote] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const fetchedNote = await fetchOneNote(token, noteId);
        setNote(fetchedNote);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [token, noteId]);

  const handleSave = async () => {
    try {
      const updatedNote = await updateNote(token, noteId, note);
      setNote(updatedNote); // Update state with the latest data
      navigate(`/notes/`);
    } catch (err) {
      setError(err);
    }
  };

  const handleMapChange = ([lng, lat]) => {
    setNote((prev) => ({
      ...prev,
      location: { type: "Point", coordinates: [lng, lat] },
    }));
  };




  return (
    <div className="edit-container">
      <h1>Edit Note</h1>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {note && (
        <>
          <div className="note-container">
            <textarea
              value={note.body}
              onChange={(e) => setNote(prev => ({ ...prev, body: e.target.value }))}
              style={{ height: "400px" }}
            />
            <div className="markdown-preview">
              <h4>Preview</h4>
              <div
                dangerouslySetInnerHTML={{ __html: marked(note.body) }}
              />
            </div>
          </div>
          

          <button onClick={handleSave}>Save Changes</button>
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this note?")) {
                dispatch(deleteNote({ id: note._id, token }))
                  .unwrap()
                  .then(() => navigate("/notes"));
              }
            }}
          >
            Delete Note
          </button>
          <Mapmark note={note} setNote={setNote} onMapChange={handleMapChange} style={{ width: "600px" }}/>
        </>
      )}
    </div>
  );
};

export default NoteEdit;
