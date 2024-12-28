import axios from "axios";

// API base URL - will work both in development and production
const BASE_URL = import.meta.env.VITE_API_URL || 'https://placenotes.onrender.com';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Utility to validate coordinates
const validateCoordinates = (latitude, longitude) => {
  if (typeof latitude !== "number" || typeof longitude !== "number" || isNaN(latitude) || isNaN(longitude)) {
    return { latitude: 34.052235, longitude: -118.243683 }; // Fallback location: Los Angeles, CA
  }
  return { latitude, longitude };
};

// Fetch a single note
const fetchOneNote = async (id) => {
  try {
    const { data } = await api.get(`/notes/${id}`);
    return data;
  } catch (error) {
    console.error("Error fetching note:", error);
    return {};
  }
};

// Fetch all notes for the user
const fetchUsersNotes = async (setNotes, setUserId) => {
  try {
    const { data } = await api.get(`/notes`);
    const notes = data.map(note => ({ ...note, showFullNote: false }));
    setNotes(notes);
    if (notes.length) setUserId(notes[0].userId);
  } catch (error) {
    console.error("Error fetching user notes:", error);
  }
};

// Fetch notes by current location
const fetchNotesByCurrentLocation = async (setNotes, setUserId, { latitude: lat, longitude: lon }) => {
  const { latitude, longitude } = validateCoordinates(lat, lon);

  try {
    const response = await api.get(`/notes/location/current?lat=${latitude}&lon=${longitude}`);
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
const updateNote = async (id, update) => {
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
    const response = await api.put(
      `/notes/${id}`,
      {
        ...update,
        location: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        radius: update.radius || 100,
        recipients: update.recipients || [],
        body: update.body || "",
      }
    );

    console.log("fetchNotes ote updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating note:", error.message || error);
    throw error;
  }
};


const deleteNote = async (id) => {
  try {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
}
export { fetchOneNote, fetchUsersNotes, fetchNotesByCurrentLocation, updateNote, deleteNote};
