import React, { useEffect, useCallback, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import "./Notes.css"
import NotesMap from "./NotesMap"
import NotesList from "./NotesList"
import "leaflet/dist/leaflet.css"
import {
  fetchUsersNotes,
  fetchNotesByLocation,
  setCurrentLocation,
} from "../store/noteThunks"
import {
  selectNoteStatus,
  selectNoteError,
  selectLocation,
  selectAllNotes,
} from "../store/noteSelectors"
import { setNoteVisibility } from "../store/noteSlice"
import {
  toGeoJSONPoint,
  fromGeoJSONPoint,
  calculateDistance,
} from "../../../lib/GeoUtils"

const Notes = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const markers = useRef([])
  const [isLocationFiltered, setIsLocationFiltered] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [sortMethod, setSortMethod] = useState("time") // Default sort by time created
  const isMapExpanded = useSelector((state) => state.notes.isMapExpanded)

  const notes = useSelector(selectAllNotes)
  const status = useSelector(selectNoteStatus)
  const error = useSelector(selectNoteError)
  const currentLocation = useSelector(selectLocation)
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/users/login")
      return
    }

    dispatch(fetchUsersNotes())
  }, [dispatch, isAuthenticated, navigate])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Create GeoJSON Point format directly
          const locationData = {
            type: "Point",
            coordinates: [position.coords.longitude, position.coords.latitude],
          }
          dispatch(setCurrentLocation(locationData))
        },
        (error) => {
          console.error("Error getting location:", error)
        }
      )
    } else {
      console.error("Geolocation is not supported by this browser.")
    }
  }, [dispatch])

  const handleNoteClick = useCallback(
    (id) => {
      dispatch(
        setNoteVisibility({
          id,
          visible: !notes.find((note) => note._id === id)?.showFullNote,
        })
      )
    },
    [dispatch, notes]
  )

  const handleMouseOver = useCallback(
    (id) => {
      const noteElement = document.querySelector(`[data-note-id="${id}"]`)
      const markerElement = markers.current.find(
        (marker) => marker._popup && marker._popup._content.includes(id)
      )

      if (noteElement) {
        noteElement.style.backgroundColor = "#add8e6"
        setTimeout(() => {
          if (noteElement) {
            noteElement.style.backgroundColor = ""
          }
        }, 1000)
      }

      if (markerElement) {
        const map = markerElement._map
        if (map) {
          map.setView(markerElement.getLatLng(), map.getZoom())
        }
        markerElement.openPopup()
        markerElement.setPopupContent(markerElement.getPopup().getContent())
      }
    },
    [markers]
  )

  const handleMouseOut = useCallback(
    (id) => {
      const noteElement = document.querySelector(`[data-note-id="${id}"]`)
      const markerElement = markers.current.find(
        (marker) => marker._popup && marker._popup._content.includes(id)
      )

      if (noteElement) {
        noteElement.style.backgroundColor = ""
      }

      if (markerElement) {
        markerElement.closePopup()
        markerElement.setPopupContent(markerElement.getPopup().getContent())
      }
    },
    [markers]
  )

  const handleLocationFilter = () => {
    if (isLocationFiltered) {
      // If already filtered by location, show all notes
      dispatch(fetchUsersNotes())
      setIsLocationFiltered(false)
    } else {
      // Check if we have a valid current location
      if (
        !currentLocation ||
        !currentLocation.type ||
        !currentLocation.coordinates
      ) {
        console.error("No valid location available for filtering")
        alert(
          "Unable to filter by location. Please make sure location services are enabled."
        )
        return
      }

      console.log("Filtering by location:", {
        type: "Point",
        coordinates: currentLocation.coordinates,
      })

      // Try using a more direct approach with path parameters instead of query parameters
      const lat = currentLocation.coordinates[1]
      const lon = currentLocation.coordinates[0]

      // Use the path parameter endpoint that works consistently
      dispatch(
        fetchNotesByLocation({
          latitude: lat,
          longitude: lon,
          radius: 50000, // 10km radius
        })
      )

      setIsLocationFiltered(true)
    }
  }

  const sortNotes = (notes) => {
    // Make a copy of the array to avoid mutating the original
    const notesCopy = [...notes]

    switch (sortMethod) {
      case "time":
        return notesCopy.sort((a, b) => {
          const dateA = a?.createdAt ? new Date(a.createdAt) : new Date(0)
          const dateB = b?.createdAt ? new Date(b.createdAt) : new Date(0)
          return dateB - dateA
        })
      case "alphabetical":
        return notesCopy.sort((a, b) => {
          const bodyA = a?.body || ""
          const bodyB = b?.body || ""
          return bodyA.localeCompare(bodyB)
        })
      case "reverseAlphabetical":
        return notesCopy.sort((a, b) => {
          const bodyA = a?.body || ""
          const bodyB = b?.body || ""
          return bodyB.localeCompare(bodyA) // Reversed order
        })
      case "location":
        if (!currentLocation) return notesCopy
        return notesCopy.sort((a, b) => {
          // Calculate distance using GeoUtils (which handles GeoJSON format)
          const distanceA = calculateDistance(currentLocation, a.location)
          const distanceB = calculateDistance(currentLocation, b.location)

          // If distance calculation failed for any reason
          if (distanceA === null && distanceB === null) return 0
          if (distanceA === null) return 1
          if (distanceB === null) return -1

          return distanceA - distanceB
        })
      default:
        return notesCopy
    }
  }

  // This function is now imported from GeoUtils

  const sortedNotes = sortNotes(notes)

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
        <div
          className="toggle-bar"
          onClick={() => dispatch({ type: "notes/toggleNotesPanel" })}
        >
          <div className="toggle-handle">
            <span>{isMapExpanded ? "Expand Notes" : "Collapse Notes"}</span>
            <i
              className={`fas fa-chevron-${
                isMapExpanded ? "up" : "down"
              } toggle-icon`}
            ></i>
          </div>
        </div>

        {/* Notes content - visible when expanded, hidden when collapsed */}
        <div
          className={`notes-content ${
            !isMapExpanded ? "expanded" : "collapsed"
          }`}
        >
          <div className="notes-list-container">
            <div className="notes-header flex justify-between items-center p-sm-y">
              <h2 className="title font-semibold text-primary">Your Notes</h2>
              <div className="search-location-container flex gap-sm items-center">
                <button
                  className={`btn btn-secondary flex items-center gap-xs ${
                    isLocationFiltered ? "active" : ""
                  }`}
                  onClick={handleLocationFilter}
                >
                  <i className="fas fa-map-marker-alt"></i>
                  <span className="hidden sm:inline">
                    {isLocationFiltered
                      ? "Show All Notes"
                      : "Filter by Location"}
                  </span>
                </button>
                <div className="sort-container relative">
                  <select
                    value={sortMethod}
                    onChange={(e) => setSortMethod(e.target.value)}
                    className="px-md py-sm bg-white border border-gray-300 rounded hover:border-gray-400 focus:ring-2 focus:ring-primary focus:outline-none transition-colors appearance-none pl-8 pr-8"
                  >
                    <option value="time">Sort by Time</option>
                    <option value="alphabetical">
                      Sort Alphabetically by Note Text
                    </option>
                    <option value="reverseAlphabetical">
                      Sort Reverse Alphabetically by Note Text
                    </option>
                    <option value="location">Sort by Distance</option>
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-gray-500 icon-left">
                    {sortMethod === "time" && <i className="fas fa-clock"></i>}
                    {sortMethod === "alphabetical" && (
                      <i className="fas fa-align-left"></i>
                    )}
                    {sortMethod === "reverseAlphabetical" && (
                      <i className="fas fa-align-right"></i>
                    )}
                    {sortMethod === "location" && (
                      <i className="fas fa-map-marker-alt"></i>
                    )}
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-500 icon-right">
                    <i className="fas fa-chevron-down"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="notes-content-area">
              {sortedNotes.length === 0 ? (
                <div className="flex justify-center items-center text-center p-xl text-secondary text-lg">
                  You don't have any notes yet. Create your first note!
                </div>
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
                <Link
                  to="/notes/new"
                  className="create-note-link btn btn-primary"
                >
                  Create a new note
                </Link>
              </p>
            </div>

            {/* Status messages inside notes panel */}
            {status === "loading" && (
              <div className="notes-status-message">Loading...</div>
            )}
            {status === "failed" && (
              <div className="notes-status-message">
                Error:{" "}
                {typeof error === "string" ? error : "Failed to load notes"}
              </div>
            )}
            {notes.length === 0 && isLocationFiltered && (
              <div className="notes-status-message">
                <p className="text-secondary mb-md">
                  No notes found near your current location.
                </p>
                <button
                  onClick={() => {
                    dispatch(fetchUsersNotes())
                    setIsLocationFiltered(false)
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
      {status === "critical-failure" && (
        <div className="overlay-message">
          <div className="flex flex-col justify-center items-center min-h-200 text-center p-xl">
            <p className="text-secondary text-lg mb-md">
              Critical error loading application.
            </p>
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
  )
}

export default Notes
