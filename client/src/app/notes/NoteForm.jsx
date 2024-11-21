import React, { useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Notes.css";
import Mapmark from "./Mapmark";

const NoteForm = () => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token") || null;
  const [note, setNote] = useState({ body: "", location: { coordinates: [] }, radius: 100, _id: "" });
  const [coordinates, setCoordinates] = useState([]);
  const [radius, setRadius] = useState(100);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNote((prevNote) => ({ ...prevNote, [name]: value }));
  };

  const handleLocationChange = useCallback(
    (coordinates) => {
      setCoordinates(coordinates);
      setNote((prevNote) => ({ ...prevNote, location: { coordinates } }));
    },
    [setNote]
  );

  const handleRadiusChange = useCallback(
    (radius) => {
      setRadius(radius);
      setNote((prevNote) => ({ ...prevNote, radius }));
    },
    [setNote]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        const response = await axios.post(
          "http://localhost:5000/notes",
          {
            ...note,
            location: { coordinates },
            radius,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setNote((prevNote) => ({ ...prevNote, _id: response.data._id }));
        navigate(`/notes/${response.data._id}`);
      } catch (err) {
        console.error("Error creating note:", err);
      }
    },
    [note, token, coordinates, radius, navigate]
  );

  return (
    <div>
      <h1>Create New Note</h1>
      <form onSubmit={handleSubmit}>
        <Mapmark
          note={note}
          onLocationChange={handleLocationChange}
          onRadiusChange={handleRadiusChange}
          coordinates={coordinates}
          radius={radius}
        />
        <label htmlFor="body">Note:</label>
        <textarea
          name="body"
          id="body"
          value={note.body}
          onChange={handleChange}
          style={{ height: "400px", width: "800px" }}
        ></textarea>
        <button type="submit">Create Note</button>
        <button type="button" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </form>
    </div>
  );
};

export default NoteForm;

