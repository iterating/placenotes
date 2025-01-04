import axios from "axios";
import { SERVER } from "../app/config";

// Utility to validate coordinates
const validateCoordinates = (latitude, longitude) => {
  if (typeof latitude !== "number" || typeof longitude !== "number" || isNaN(latitude) || isNaN(longitude)) {
    return { latitude: 34.052235, longitude: -118.243683 }; // Fallback location: Los Angeles, CA
  }
  return { latitude, longitude };
};

// Fetch a single note
const fetchOneNote = async (token, id) => {
  if (!token) return {};
  try {
    const { data } = await axios.get(`${SERVER}/notes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    console.error("Error fetching note:", error);
    return {};
  }
};

// Fetch all notes for the user
const fetchUsersNotes = async (token, setNotes, setUserId) => {
  if (!token) return;
  try {
    const { data } = await axios.get(`${SERVER}/notes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const notes = data.map(note => ({ ...note, showFullNote: false }));
    setNotes(notes);
    if (notes.length) setUserId(notes[0].userId);
  } catch (error) {
    console.error("Error fetching user notes:", error);
  }
};

// Fetch notes by current location
const fetchNotesByCurrentLocation = async (token, setNotes, setUserId, { latitude: lat, longitude: lon }) => {
  if (!token) return;

  const { latitude, longitude } = validateCoordinates(lat, lon);

  try {
    const response = await axios.get(`${SERVER}/notes/location/current?lat=${latitude}&lon=${longitude}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const notes = response.data.map(note => ({
      ...note,
      showFullNote: false,
      location: {
        type: "Point",
        coordinates: [note.location?.coordinates?.[0] || longitude, note.location?.coordinates?.[1] || latitude], // validate point
      },
    }));
    setNotes(notes);
    if (notes.length) setUserId(notes[0].userId);
  } catch (error) {
    console.error("Error fetching notes by current location:", error);
  }
};

// Update a note
const updateNote = async (token, id, update) => {
  if (!token) {
    console.error("Token is required for authentication.");
    return;
  }

  try {
    console.log("fetchNotes Starting note update process...");
    
    // Validate location coordinates
    if (
      !update.location ||
      !update.location.coordinates ||
      update.location.coordinates.length !== 2
    ) {
      console.error("Location validation failed.");
      throw new Error(
        "Location coordinates are required and must contain both longitude and latitude."
      );
    }

    const [longitude, latitude] = update.location.coordinates;
    console.log("fetchNotes Extracted coordinates:", longitude, latitude);

    // Validate coordinates for Geojson
    if (
      typeof longitude !== "number" ||
      typeof latitude !== "number" ||
      longitude < -180 || longitude > 180 ||
      latitude < -90 || latitude > 90
    ) {
      console.error("Coordinate validation failed.");
      throw new Error("Invalid longitude or latitude values.");
    }

    console.log(" fetchNotes Sending update request to server...");
    const response = await axios.put(
      `${SERVER}/notes/${id}`,
      {
        ...update,
        location: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        radius: update.radius || 100,
        recipients: update.recipients || [],
        body: update.body || "",
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("fetchNotes Note updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating note:", error.message || error);
    throw error;
  }
};

const deleteNote = async (token, id) => {
  if (!token) return;

  try {
    const response = await axios.delete(`${SERVER}/notes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
}

export { fetchOneNote, fetchUsersNotes, fetchNotesByCurrentLocation, updateNote, deleteNote };
