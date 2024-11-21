import React, { useMemo, useCallback, useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Notes.css";
import Mapmark from "./Mapmark";
import { fetchOneNote, updateNote } from "../../store/noteStoreAction";
const NotesEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useSelector((state) => state.user && state.user.token);
  const note = useSelector((state) => state.notes[id]) || { user: "", title: "", body: "", location: { type: "Point", coordinates: [0, 0] } };
  const dispatch = useDispatch();

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      dispatch(updateNote({ id, changes: { [name]: value } }));
    },
    [id, dispatch]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        await axios.put(
          `http://localhost:5000/notes/${id}`,
          { ...note },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        navigate(`/notes/`);
      } catch (err) {
        console.error("Error updating note:", err);
      }
    },
    [id, token, navigate, dispatch, note]
  );

  const mapProps = useMemo(
    () => ({
      note,
      onChange: handleChange,
    }),
    [note, handleChange]
  );

  return (
    <div>
      <h1>Edit Note</h1>
      <form onSubmit={handleSubmit}>
        <Mapmark {...mapProps} />
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default NotesEdit;

