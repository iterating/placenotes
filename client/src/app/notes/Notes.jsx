import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import "./Notes.css";
import { fetchUsersNotes } from "../../lib/fetchNotes";
import NotesMap from "./NotesMap";
import NotesList from "./NotesList";
import "leaflet/dist/leaflet.css";
import { getCurrentLocation } from "../../lib/Location";

const Notes = () => {
  const token = sessionStorage.getItem("token") || null;
  const [notes, setNotes] = useState([]);
  const [userId, setUserId] = useState(() => {
    if (token) {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      return decoded._id;
    }
    return null;
  });
  const [currentLocation, setCurrentLocation] = useState(JSON.parse(sessionStorage.getItem("currentLocation")) || null);
  const markers = React.useRef([]);

  useEffect(() => {
    if (token) {
      console.log("Fetching notes...");
      fetchUsersNotes(token, setNotes, setUserId);
    }
  }, [token]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setCurrentLocation(newLocation);
          sessionStorage.setItem("currentLocation", JSON.stringify(newLocation));
          console.log("Current location:", newLocation);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

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
      <div className="map-container" id="map-container-home">
        <NotesMap
          notes={notes}
          handleMouseOver={handleMouseOver}
          handleMouseOut={handleMouseOut}
          markers={markers}
          currentLocation={currentLocation}
        />
      </div>
      <br />
      <>
      <NotesList
        notes={notes}
        handleNoteClick={handleNoteClick}
        handleMouseOver={handleMouseOver}
        handleMouseOut={handleMouseOut}
        markers={markers}
        />
        </>
      <p>
        <a href="/notes/new">Create a new note</a>
      </p>
    </div>
  );
};

export default Notes;

