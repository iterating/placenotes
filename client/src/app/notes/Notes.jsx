import React, { useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import "./Notes.css";
import NotesMap from "./NotesMap";
import NotesList from "./NotesList";
import "leaflet/dist/leaflet.css";
import { fetchUsersNotes, fetchNotesByLocation, setCurrentLocation } from "../../store/noteStoreAction";
import { 
  selectAllNotes, 
  selectNoteStatus, 
  selectNoteError, 
  selectLocation,
  setNoteVisibility 
} from "../../store/noteSlice.jsx";

const Notes = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const markers = useRef([]);
  
  const notes = useSelector(selectAllNotes);
  const status = useSelector(selectNoteStatus);
  const error = useSelector(selectNoteError);
  const currentLocation = useSelector(selectLocation);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/users/login');
      return;
    }

    dispatch(fetchUsersNotes());
  }, [dispatch, isAuthenticated, navigate]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          dispatch(setCurrentLocation(newLocation));
          
          // Optionally fetch notes near the current location
          dispatch(fetchNotesByLocation(newLocation));
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, [dispatch]);

  const handleNoteClick = useCallback((id) => {
    dispatch(setNoteVisibility({ id, visible: !notes.find(note => note._id === id)?.showFullNote }));
  }, [dispatch, notes]);

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

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'failed') return <div>Error: {error}</div>;

  return (
    <div className="note-container">
      <h1 className="title">Your Notes</h1>
      <div className="map-container" id="map-container-home">
        <NotesMap
          notes={notes}
          currentLocation={currentLocation}
          markers={markers}
          onMarkerClick={handleNoteClick}
          handleMouseOver={handleMouseOver}
          handleMouseOut={handleMouseOut}
        />
      </div>
      <div className="notes-list">
        <NotesList
          notes={notes}
          onNoteClick={handleNoteClick}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
          markers={markers}
        />
        <p>
          <a href="/notes/new">Create a new note</a>
        </p>
      </div>
    </div>
  );
};

export default Notes;
