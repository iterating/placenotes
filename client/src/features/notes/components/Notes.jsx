import React, { useEffect, useCallback, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import "./Notes.css";
import NotesMap from "./NotesMap";
import NotesList from "./NotesList";
import "leaflet/dist/leaflet.css";
import { fetchUsersNotes, fetchNotesByLocation, setCurrentLocation } from "../../../store/noteStoreAction";
import { 
  selectAllNotes, 
  selectNoteStatus, 
  selectNoteError, 
  selectLocation,
  setNoteVisibility 
} from "../../../store/noteSlice";

const Notes = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const markers = useRef([]);
  const [isLocationFiltered, setIsLocationFiltered] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const isMapExpanded = useSelector(state => state.notes.isMapExpanded);
  
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
      marker._popup && marker._popup._content.includes(id)
    );
    
    if (noteElement) {
      noteElement.style.backgroundColor = "#add8e6";
      setTimeout(() => {
        if (noteElement) {
          noteElement.style.backgroundColor = "";
        }
      }, 1000);
    }
    
    if (markerElement) {
      const map = markerElement._map;
      if (map) {
        map.setView(markerElement.getLatLng(), map.getZoom());
      }
      markerElement.openPopup();
      markerElement.setPopupContent(markerElement.getPopup().getContent());
    }
  }, [markers]);

  const handleMouseOut = useCallback((id) => {
    const noteElement = document.querySelector(`[data-note-id="${id}"]`);
    const markerElement = markers.current.find((marker) => 
      marker._popup && marker._popup._content.includes(id)
    );
    
    if (noteElement) {
      noteElement.style.backgroundColor = "";
    }
    
    if (markerElement) {
      markerElement.closePopup();
      markerElement.setPopupContent(markerElement.getPopup().getContent());
    }
  }, [markers]);

  const handleLocationFilter = () => {
    if (!currentLocation) {
      alert("Location is not available. Please ensure location services are enabled.");
      return;
    }

    if (isLocationFiltered) {
      // If already filtered by location, show all notes
      dispatch(fetchUsersNotes());
      setIsLocationFiltered(false);
    } else {
      // Filter by location
      dispatch(fetchNotesByLocation({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude
      }));
      setIsLocationFiltered(true);
    }
  };

  if (status === 'loading') return <div className="flex justify-center items-center min-h-200 text-center p-xl text-secondary text-lg">Loading...</div>;
  if (status === 'failed') return <div className="flex justify-center items-center min-h-200 text-center p-xl text-secondary text-lg">Error: {typeof error === 'string' ? error : 'Failed to load notes'}</div>;

  return (
    <div className="note-container flex flex-col gap-md p-md">
      <div className={`map-container ${!isMapExpanded ? 'collapsed' : ''}`} id="map-container-home">
        <NotesMap
          notes={notes}
          currentLocation={currentLocation}
          markers={markers}
          onMarkerClick={handleNoteClick}
          handleMouseOver={handleMouseOver}
          handleMouseOut={handleMouseOut}
        />
      </div>
      <div className="notes-list overflow-y-auto p-xs">
        <div className="notes-header flex justify-between items-center p-sm-y">
          <h2 className="title font-semibold text-primary">Your Notes</h2>
          <div className="search-location-container flex gap-sm items-center">
            <button 
              className="btn btn-secondary"
              onClick={handleLocationFilter}
            >
              {isLocationFiltered ? "Show All Notes" : "Filter by Location"}
            </button>
          </div>
        </div>
        <NotesList
          notes={notes}
          onNoteClick={handleNoteClick}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
          markers={markers}
        />
        <p className="mt-md">
          <Link to="/notes/new" className="create-note-link btn btn-primary">Create a new note</Link>
        </p>
      </div>
    </div>
  );
};

export default Notes;
