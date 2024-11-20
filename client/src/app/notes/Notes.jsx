import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import "./Notes.css";
import { marked } from "marked";
import fetchNotes from "./FetchNotes";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const NotesMap = ({ notes, handleMouseOver, handleMouseOut, markers }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView(
        [34.052235, -118.243683],
        13
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
        mapInstance.current
      );
    }

    const map = mapInstance.current;

    markers.current.forEach((marker) => map.removeLayer(marker));
    markers.current = notes?.flatMap((note) => {
      if (!note.location) return [];
      const marker = L.marker([
        note.location.coordinates[1],
        note.location.coordinates[0],
      ]).addTo(map);
      marker.bindPopup(
        `<div>${note.body.split('\n')[0]}</div><a href="/notes/${note._id}/edit">Edit Note</a>`
      );

      marker.on("mouseover", () => {
        handleMouseOver(note._id);
        marker.openPopup();
      });

      marker.on("mouseout", () => {
        handleMouseOut(note._id);
        marker.closePopup();
      });

      return [marker];
    });

    map.invalidateSize();
  }, [notes, handleMouseOver, handleMouseOut, markers]);

  return <div id="map" ref={mapRef} style={{ height: "400px" }}></div>;
};

const NotesList = ({ notes, handleNoteClick, handleMouseOver, handleMouseOut, markers }) => {
  return (
    <div>
      {notes.length > 0 ? (
        notes.map((note) => (
          <Note
            key={note._id}
            note={note}
            onClick={() => handleNoteClick(note._id)}
            onMouseOver={() => handleMouseOver(note._id)}
            onMouseOut={() => handleMouseOut(note._id)}
            markers={markers}
            style={{
              backgroundColor: note.showFullNote ? "#add8e6" : "",
            }}
          />
        ))
      ) : (
        <p>You don't have any notes yet.</p>
      )}
    </div>
  );
};

const Note = ({ note, markers }) => {
  const [showFullNote, setShowFullNote] = useState(false);

  return (
    <div>
      <div
        className="note-preview"
        onClick={() => setShowFullNote(!showFullNote)}
        data-note-id={note._id}
        onMouseOver={() => {
          const markerElement = markers.current.find((marker) =>
            marker.getPopup()?.getContent().includes(`Edit Note`)
          );
          if (markerElement) markerElement.openPopup();
        }}
        onMouseOut={() => {
          const markerElement = markers.current.find((marker) =>
            marker.getPopup()?.getContent().includes(`Edit Note`)
          );
          if (markerElement) markerElement.closePopup();
        }}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: marked(showFullNote ? note.body : note.body.split('\n')[0]),
          }}
        />
      </div>
      <div className="note-actions-ui">
        <form action={`/notes/${note._id}/edit`} method="GET" className="button">
          <button type="submit">Edit</button>
        </form>
        <br/>
        <form action={`/notes/${note._id}/delete`} method="POST" className="button delete-button">
          <button type="submit">Delete</button>
          <input type="hidden" name="_method" value="DELETE" />
        </form>
      </div>
    </div>
  );
};

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [userId, setUserId] = useState(null);
  const token = useMemo(() => sessionStorage.getItem("token"), []);
  const markers = useRef([]);

  useEffect(() => {
    if (token) {
      console.log("Fetching notes...");
      fetchNotes(token, setNotes, setUserId);
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
    if (markerElement) markerElement.openPopup();
  }, [markers]);

  const handleMouseOut = useCallback((id) => {
    const noteElement = document.querySelector(`[data-note-id="${id}"]`);
    const markerElement = markers.current.find((marker) =>
      marker.getPopup()?.getContent().includes(`Edit Note`)
    );
    if (noteElement) noteElement.style.backgroundColor = "";
    if (markerElement) markerElement.closePopup();
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


