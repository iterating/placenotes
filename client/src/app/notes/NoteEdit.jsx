import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./Notes.css";
import { fetchOneNote } from "../../lib/fetchNotes";
import Mapmark from "./Mapmark";

const NotesEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token") || null;
  const [note, setNote] = useState({});

  useEffect(() => {
    if (token) {
      fetchOneNote(token, id).then((note) => setNote(note));
    }
  }, [token, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNote((prevNote) => ({ ...prevNote, [name]: value }));
  };

  const handleLocationChange = (coordinates) => {
    setNote((prevNote) => ({ ...prevNote, location: { coordinates } }));
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        await axios.put(`http://localhost:5000/notes/${id}`, note, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        navigate(`/notes/`);
      } catch (err) {
        console.error("Error updating note:", err);
      }
    },
    [note, id, token, navigate]
  );

  return (
    <div>
      <h1>Edit Note</h1>
      <form onSubmit={handleSubmit}>
        <Mapmark note={note} onLocationChange={handleLocationChange} />
        <label htmlFor="body">Note:</label>
        <textarea
          name="body"
          id="body"
          value={note.body || ""}
          onChange={handleChange}
          style={{ height: "400px", width: "800px" }}
        ></textarea>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default NotesEdit;

