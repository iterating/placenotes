import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Notes.css";

const NoteNew = () => {
  const [body, setBody] = useState("");
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState(200);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("token"); 
      // const response = await axios.post(
      //   "http://localhost:5000/notes",
      //   { body, location, radius },
      //   {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //   }
      // );
      console.log("Note created:", response.data);
      navigate("/notes");
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  return (
    <div className="edit-container">
      <h1 className="title">Create New Note</h1>
      <form onSubmit={handleSubmit} className="edit-note-form">
        <label htmlFor="note-body">Note:</label><br />
        <textarea
          name="body"
          id="note-body"
          rows="8"
          cols="80"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        ></textarea><br />
        <input
          type="hidden"
          name="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          type="hidden"
          name="radius"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
        />
        <input type="submit" value="Create Note" />
        <button type="button" onClick={() => navigate("/notes")}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default NoteNew;
