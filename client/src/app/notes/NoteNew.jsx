import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import "./Notes.css";
import Mapmark from "./Mapmark";
import { createNote } from "../../store/noteStoreAction";

const NoteNew = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const user = useSelector(state => state.auth.user);

  const [body, setBody] = useState("");
  const [radius, setRadius] = useState(100);
  const [location, setLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/users/login');
      return;
    }

    // Get initial location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            type: "Point",
            coordinates: [position.coords.longitude, position.coords.latitude],
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          setError("Could not get your location. Please enable location services.");
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setError("Geolocation is not supported by your browser");
    }
  }, [isAuthenticated, user, navigate]);

  const handleMapChange = (lat, lng) => {
    setLocation({
      type: "Point",
      coordinates: [lng, lat],
    });
    setError(null); // Clear any previous location errors
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!location?.coordinates || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
        throw new Error("Please select a valid location on the map");
      }

      if (!body.trim()) {
        throw new Error("Please enter a note");
      }

      if (!user?._id) {
        throw new Error("User information not available");
      }

      const noteData = {
        body: body.trim(),
        location,
        radius,
        userId: user._id,
        email: user.email,
        time: new Date().toISOString(),
        type: "note",
        status: "active"
      };

      await dispatch(createNote(noteData)).unwrap();
      navigate("/notes");
    } catch (error) {
      console.error("Error creating note:", error);
      setError(error.message || "Failed to create note. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null; // Component will redirect in useEffect
  }

  return (
    <div className="edit-container">
      <h1>Create New Note</h1>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="edit-note-form">
        <div className="form-group">
          <label htmlFor="note-body">Note:</label>
          <textarea
            id="note-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            placeholder="Enter your note here..."
            className="note-textarea"
            style={{
              minHeight: "200px",
              maxHeight: "50vh",
              width: "100%",
              padding: "10px",
              marginBottom: "20px",
              resize: "vertical"
            }}
          />
        </div>
        
        <div className="map-section">
          <label>Location:</label>
          <Mapmark
            note={{
              body,
              location,
              radius,
            }}
            onMapChange={handleMapChange}
            coordinates={location?.coordinates}
          />
        </div>

        <div className="form-buttons">
          <button 
            type="submit" 
            disabled={isSubmitting || !location}
            className="submit-button"
          >
            {isSubmitting ? "Creating..." : "Create Note"}
          </button>
          <button 
            type="button" 
            onClick={() => navigate("/notes")}
            className="cancel-button"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default NoteNew;
