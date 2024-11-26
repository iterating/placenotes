import axios from "axios";
// BASE_URL = 'http://localhost:5000';

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
    const { data } = await axios.get(`http://localhost:5000/notes/${id}`, {
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
    const { data } = await axios.get(`http://localhost:5000/notes`, {
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
    const response = await axios.get(`http://localhost:5000/notes/location/current?lat=${latitude}&lon=${longitude}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const notes = response.data.map(note => ({
      ...note,
      showFullNote: false,
      location: {
        type: "Point",
        coordinates: [note.location?.coordinates?.[0] || longitude, note.location?.coordinates?.[1] || latitude], // Ensure it's a valid Point
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
  if (!token) return;

  try {
    // Check if location.coordinates is null or invalid
    if (!update.location || !update.location.coordinates || update.location.coordinates.length !== 2) {
      throw new Error("Location coordinates are required and must contain both latitude and longitude.");
    }

    // Ensure location is valid before sending
    const { latitude, longitude } = validateCoordinates(update.location.latitude, update.location.longitude);

    const response = await axios.post(`http://localhost:5000/notes/${id}/edit`, {
      ...update,
      location: {
        type: "Point",
        coordinates: [longitude, latitude], // Ensure it's a valid GeoJSON Point
      },
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating note:", error);
    // Optionally, handle the error more gracefully or show an alert to the user
  }
};

const deleteNote = async (token, id) => {
  if (!token) return;

  try {
    const response = await axios.delete(`http://localhost:5000/notes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
}
export { fetchOneNote, fetchUsersNotes, fetchNotesByCurrentLocation, updateNote, deleteNote};

