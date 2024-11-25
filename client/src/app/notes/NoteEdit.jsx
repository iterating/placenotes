import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateNote } from "../../store/noteStoreAction";
import NoteTiptap from "./NoteTiptap";
import { fetchOneNote } from "../../lib/fetchNotes.js";

const NoteEdit = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { noteId } = useParams();
  const { token } = useLocation().state;
  const [note, setNote] = useState({ body: "", location: { coordinates: [] }, radius: 100, _id: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const fetchedNote = await fetchOneNote(token, noteId);
        setNote(fetchedNote);
      } catch (err) {
        setError(err);
        console.error("Error fetching note:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [token, noteId]);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      try {
        await dispatch(updateNote({ token, id: noteId, note: note })); 
        navigate(`/notes/`);
      } catch (err) {
        setError(err);
        console.error("Error submitting form:", err);
      }
    },
    [dispatch, token, noteId, navigate, note] 
  );

  return (
    <>
      <h1>Edit Note</h1>
      {note && <NoteTiptap note={note} setNote={setNote} />}
      <form onSubmit={handleSubmit}>
        <button type="submit">Save Changes</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
    </>
  );
};

export default NoteEdit;

