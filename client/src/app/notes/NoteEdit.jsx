import React, { useState, useEffect } from "react";
import {  useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateNote, deleteNote,  } from "../../store/noteStoreAction";
import NoteTiptap from "./NoteTiptap"
import { fetchOneNote} from "../../lib/fetchNotes.js"

const NoteEdit = ({ noteId, token }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [note, setNote] = useState({});

  useEffect(() => {
    console.log(noteId, "note", note);
    fetchOneNote(token, noteId).then(setNote);
  }, [noteId]);

  const handleSubmit = React.useCallback(
    async (event) => {
      event.preventDefault();
      try {
        await dispatch(updateNote({ token, id: noteId, note })).unwrap();
        navigate(`/notes/`);
      } catch (error) {
        console.error("Error updating note", error);
      }
    },
    [dispatch, token, noteId, navigate, note]
  );

  return (
    <div>
      <h1>Edit Note</h1>
      <NoteTiptap note={note} />
      <form onSubmit={handleSubmit}>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default NoteEdit;