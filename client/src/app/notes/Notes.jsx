import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import "./Notes.css";
import {  fetchUsersNotes} from "../../lib/fetchNotes";
import NotesMap from "./NotesMap"
import NotesList from "./NotesList"
import "leaflet/dist/leaflet.css";
import Note from "./NoteCard";

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [userId, setUserId] = useState(null);
  const token = sessionStorage.getItem("token") || null;
  const markers = React.useRef([]);

  useEffect(() => {
    if (token) {
      console.log("Fetching notes...");
      fetchUsersNotes(token, setNotes, setUserId);
    }
  }, [token]);

  const handleNoteClick = useCallback((id) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note._id === id ? { ...note, showFullNote: !note.showFullNote } : note
      )
    );
  }, []);

  const handleMouseOver = useCallback((id) => {
    const noteElement = document.querySelector(`[data-note-id="${id}"]`);
    const markerElement = markers.current.find((marker) =>
      marker.getPopup()?.getContent().includes(`Edit Note`)
    );
    if (noteElement) noteElement.style.backgroundColor = "#add8e6";
    if (markerElement) {
      markerElement.openPopup();
      markerElement.setPopupContent(markerElement.getPopup().getContent());
    }
  }, [markers]);

  const handleMouseOut = useCallback((id) => {
    const noteElement = document.querySelector(`[data-note-id="${id}"]`);
    const markerElement = markers.current.find((marker) =>
      marker.getPopup()?.getContent().includes(`Edit Note`)
    );
    if (noteElement) noteElement.style.backgroundColor = "";
    if (markerElement) {
      markerElement.closePopup();
      markerElement.setPopupContent("");
    }
  }, [markers]);

  return (
    <div className="note-container">
      <h1 className="title">Your Notes</h1>
      <div className="map-container" style={{ width: "800px", height: "400px" }}>
        <NotesMap
          notes={notes}
          handleMouseOver={handleMouseOver}
          handleMouseOut={handleMouseOut}
          markers={markers}
        />
      </div>
      <NotesList
        notes={notes}
        handleNoteClick={handleNoteClick}
        handleMouseOver={handleMouseOver}
        handleMouseOut={handleMouseOut}
        markers={markers}
      />
      <p>
        <a href="/notes/new">Create a new note</a>
      </p>
    </div>
  );
};

export default Notes;
