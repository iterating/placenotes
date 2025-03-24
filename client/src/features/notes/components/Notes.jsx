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
  const [sortMethod, setSortMethod] = useState('time'); // Default sort by time created
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
    if (isLocationFiltered) {
      // If already filtered by location, show all notes
      dispatch(fetchUsersNotes());
      setIsLocationFiltered(false);
    } else {
      // Check if we have a valid current location
      if (!currentLocation || !currentLocation.latitude || !currentLocation.longitude) {
        console.error("No valid location available for filtering");
        alert("Unable to filter by location. Please make sure location services are enabled.");
        return;
      }
      
      console.log("Filtering by location:", {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude
      });
      
      // Try using a more direct approach with path parameters instead of query parameters
      const lat = currentLocation.latitude;
      const lon = currentLocation.longitude;
      
      // Use the path parameter endpoint that works consistently
      dispatch(fetchNotesByLocation({
        latitude: lat,
        longitude: lon,
        radius: 50000 // 10km radius
      }));
      
      setIsLocationFiltered(true);
    }
  };

  const sortNotes = (notes) => {
    // Make a copy of the array to avoid mutating the original
    const notesCopy = [...notes];

    switch (sortMethod) {
      case 'time':
        return notesCopy.sort((a, b) => {
          const dateA = a?.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b?.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB - dateA;
        });
      case 'alphabetical':
        return notesCopy.sort((a, b) => {
          const bodyA = a?.body || '';
          const bodyB = b?.body || '';
          return bodyA.localeCompare(bodyB);
        });
      case 'reverseAlphabetical':
        return notesCopy.sort((a, b) => {
          const bodyA = a?.body || '';
          const bodyB = b?.body || '';
          return bodyB.localeCompare(bodyA); // Reversed order
        });
      case 'location':
        if (!currentLocation) return notesCopy;
        return notesCopy.sort((a, b) => {
          // Extract coordinates from GeoJSON format if available
          const locationA = a?.location?.coordinates 
            ? { latitude: a.location.coordinates[1], longitude: a.location.coordinates[0] }
            : a?.location || null;
          const locationB = b?.location?.coordinates 
            ? { latitude: b.location.coordinates[1], longitude: b.location.coordinates[0] }
            : b?.location || null;
          
          const distanceA = calculateDistance(currentLocation, locationA);
          const distanceB = calculateDistance(currentLocation, locationB);
          return distanceA - distanceB;
        });
      default:
        return notesCopy;
    }
  };

  const calculateDistance = (location1, location2) => {
    // Handle missing location data
    if (!location1 || !location2 || 
        typeof location1.latitude !== 'number' || typeof location1.longitude !== 'number' ||
        typeof location2.latitude !== 'number' || typeof location2.longitude !== 'number' ||
        isNaN(location1.latitude) || isNaN(location1.longitude) ||
        isNaN(location2.latitude) || isNaN(location2.longitude)) {
      return Infinity; // Place items with missing location at the end
    }
    
    const lat1 = location1.latitude;
    const lon1 = location1.longitude;
    const lat2 = location2.latitude;
    const lon2 = location2.longitude;
    const R = 6371; // km
    
    try {
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const lat1Rad = lat1 * Math.PI / 180;
      const lat2Rad = lat2 * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad); 
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
      const distance = R * c;
      return isNaN(distance) ? Infinity : distance;
    } catch (error) {
      console.error('Error calculating distance:', error);
      return Infinity;
    }
  };

  const sortedNotes = sortNotes(notes);

  return (
    <div className="note-container">
      {/* Map container as the fixed bottom layer */}
      <div className="map-container">
        <NotesMap
          notes={sortedNotes}
          currentLocation={currentLocation}
          markers={markers}
          onMarkerClick={handleNoteClick}
          handleMouseOver={handleMouseOver}
          handleMouseOut={handleMouseOut}
        />
      </div>

      {/* Notes panel at the bottom of the screen */}
      <div className="notes-panel">
        {/* Toggle bar at the bottom, controls visibility of notes content */}
        <div className="toggle-bar" onClick={() => dispatch({ type: 'notes/toggleNotesPanel' })}>
          <div className="toggle-handle">
            <span>{isMapExpanded ? 'Expand Notes' : 'Collapse Notes'}</span>
            <i className={`fas fa-chevron-${isMapExpanded ? 'up' : 'down'} toggle-icon`}></i>
          </div>
        </div>
        
        {/* Notes content - visible when expanded, hidden when collapsed */}
        <div className={`notes-content ${!isMapExpanded ? 'expanded' : 'collapsed'}`}>
          <div className="notes-list-container">
            <div className="notes-header flex justify-between items-center p-sm-y">
              <h2 className="title font-semibold text-primary">Your Notes</h2>
              <div className="search-location-container flex gap-sm items-center">
                <button 
                  className={`btn btn-secondary flex items-center gap-xs ${isLocationFiltered ? 'active' : ''}`}
                  onClick={handleLocationFilter}
                >
                  <i className="fas fa-map-marker-alt"></i>
                  <span className="hidden sm:inline">{isLocationFiltered ? "Show All Notes" : "Filter by Location"}</span>
                </button>
                <div className="sort-container relative">
                  <select 
                    value={sortMethod} 
                    onChange={(e) => setSortMethod(e.target.value)}
                    className="px-md py-sm bg-white border border-gray-300 rounded hover:border-gray-400 focus:ring-2 focus:ring-primary focus:outline-none transition-colors appearance-none pl-8 pr-8"
                  >
                    <option value="time">Sort by Time</option>
                    <option value="alphabetical">Sort Alphabetically by Note Text</option>
                    <option value="reverseAlphabetical">Sort Reverse Alphabetically by Note Text</option>
                    <option value="location">Sort by Distance</option>
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-gray-500 icon-left">
                    {sortMethod === 'time' && <i className="fas fa-clock"></i>}
                    {sortMethod === 'alphabetical' && <i className="fas fa-align-left"></i>}
                    {sortMethod === 'reverseAlphabetical' && <i className="fas fa-align-right"></i>}
                    {sortMethod === 'location' && <i className="fas fa-map-marker-alt"></i>}
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-500 icon-right">
                    <i className="fas fa-chevron-down"></i>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="notes-content-area">
              {sortedNotes.length === 0 ? (
                <div className="flex justify-center items-center min-h-200 text-center p-xl text-secondary text-lg">You don't have any notes yet. Create your first note!</div>
              ) : (
                <NotesList
                  notes={sortedNotes}
                  onNoteClick={handleNoteClick}
                  onMouseOver={handleMouseOver}
                  onMouseOut={handleMouseOut}
                  markers={markers}
                />
              )}
              
              <p className="mt-md">
                <Link to="/notes/new" className="create-note-link btn btn-primary">Create a new note</Link>
              </p>
            </div>
            
            {/* Status messages inside notes panel */}
            {status === 'loading' && (
              <div className="notes-status-message">Loading...</div>
            )}
            {status === 'failed' && (
              <div className="notes-status-message">Error: {typeof error === 'string' ? error : 'Failed to load notes'}</div>
            )}
            {notes.length === 0 && isLocationFiltered && (
              <div className="notes-status-message">
                <p className="text-secondary mb-md">No notes found near your current location.</p>
                <button 
                  onClick={() => {
                    dispatch(fetchUsersNotes());
                    setIsLocationFiltered(false);
                  }}
                  className="px-md py-sm bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                >
                  Show all notes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay messages only shown for critical errors/states */}
      {status === 'critical-failure' && (
        <div className="overlay-message">
          <div className="flex flex-col justify-center items-center min-h-200 text-center p-xl">
            <p className="text-secondary text-lg mb-md">Critical error loading application.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-md py-sm bg-primary text-white rounded hover:bg-primary-dark transition-colors"
            >
              Refresh page
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
