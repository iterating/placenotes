import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNoteSearch } from '../../hooks/useNoteSearch';
import { useGeolocation } from '../../hooks/useGeolocation';
import NotesList from '../notes/components/NotesList';
import NotesMap from '../notes/components/NotesMap';
import 'leaflet/dist/leaflet.css';
import './NoteSearch.css';

const NoteSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const { searchNotes, clearSearch, searchResults, isSearching, error } = useNoteSearch();
  const { getCurrentPosition } = useGeolocation();
  const markers = useRef([]);

  const handleSearch = useCallback(async (useLocation = false) => {
    if (!searchQuery && !useLocation) return;

    let searchParams = { query: searchQuery };

    if (useLocation) {
      try {
        const position = await getCurrentPosition();
        const locationData = {
          type: 'Point',
          coordinates: [position.coords.longitude, position.coords.latitude]
        };
        searchParams.location = locationData;
        searchParams.radius = 1000; // 1km radius
      } catch (error) {
        console.error('Failed to get location:', error);
      }
    }

    searchNotes(searchParams);
  }, [searchQuery, searchNotes, getCurrentPosition]);

  const handleClear = useCallback(() => {
    setSearchQuery('');
    clearSearch();
  }, [clearSearch]);

  const handleNoteClick = useCallback(() => {
    // No-op for search page, could add functionality later
  }, []);

  const handleMouseOver = useCallback((id) => {
    const noteElement = document.querySelector(`[data-note-id="${id}"]`);
    const markerElement = markers.current.find(
      (marker) => marker._popup && marker._popup._content.includes(id)
    );

    if (noteElement) {
      noteElement.style.backgroundColor = '#add8e6';
      setTimeout(() => {
        if (noteElement) {
          noteElement.style.backgroundColor = '';
        }
      }, 1000);
    }

    if (markerElement) {
      const map = markerElement._map;
      if (map) {
        map.setView(markerElement.getLatLng(), map.getZoom());
      }
      markerElement.openPopup();
    }
  }, []);

  const handleMouseOut = useCallback((id) => {
    const noteElement = document.querySelector(`[data-note-id="${id}"]`);
    const markerElement = markers.current.find(
      (marker) => marker._popup && marker._popup._content.includes(id)
    );

    if (noteElement) {
      noteElement.style.backgroundColor = '';
    }

    if (markerElement) {
      markerElement.closePopup();
    }
  }, []);

  // Get current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            type: 'Point',
            coordinates: [position.coords.longitude, position.coords.latitude],
          };
          setCurrentLocation(locationData);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  return (
    <div className="note-search-container">
      {/* Map container */}
      <div className="map-container">
        <NotesMap
          notes={searchResults}
          currentLocation={currentLocation}
          markers={markers}
          onMarkerClick={handleNoteClick}
          handleMouseOver={handleMouseOver}
          handleMouseOut={handleMouseOut}
        />
      </div>

      {/* Search panel */}
      <div className="search-panel">
        <div className="search-header">
          <h2>Search Notes</h2>
        </div>
        
        <div className="search-controls">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          {searchQuery && (
            <button 
              className="clear-button"
              onClick={handleClear}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        <button 
          className="search-button"
          onClick={() => handleSearch()}
          aria-label="Search"
        >
          🔍 Search
        </button>
        <button 
          className="location-button"
          onClick={() => handleSearch(true)}
          aria-label="Search by location"
        >
          📍 Near Me
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

        {isSearching ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Searching...</p>
          </div>
        ) : (
          <div className="search-results">
            {searchResults.length === 0 && !error ? (
              <div className="no-results">
                {searchQuery ? 'No notes found matching your search.' : 'Enter a search term or search by location to find notes.'}
              </div>
            ) : (
              <NotesList
                notes={searchResults}
                handleNoteClick={handleNoteClick}
                handleMouseOver={handleMouseOver}
                handleMouseOut={handleMouseOut}
                markers={markers}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteSearch;
