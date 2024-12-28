import axios from "axios";

// API base URL - will work both in development and production
const BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://placenotes-api.onrender.com'  // Updated to match Render service name
  : 'http://localhost:5000';

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
  async (error) => {
    console.error('API Error:', error);
    if (error.response?.status === 401) {
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
    throw error;
  }
};

// Fetch all notes for the user
const fetchUsersNotes = async (setNotes, setUserId) => {
  try {
    const { data } = await api.get('/notes');
    const notes = data.map(note => ({ ...note, showFullNote: false }));
    setNotes(notes);
    if (notes.length) setUserId(notes[0].userId);
  } catch (error) {
    console.error("Error fetching user notes:", error);
    throw error;
  }
};

// Fetch notes by current location
const fetchNotesByCurrentLocation = async (setNotes, setUserId, { latitude: lat, longitude: lon }) => {
  const { latitude, longitude } = validateCoordinates(lat, lon);

  try {
    const { data } = await api.get(`/notes/location/current?lat=${latitude}&lon=${longitude}`);
    const notes = data.map(note => ({
      ...note,
      showFullNote: false,
    }));
    setNotes(notes);
    if (notes.length) setUserId(notes[0].userId);
  } catch (error) {
    console.error("Error fetching notes by location:", error);
    throw error;
  }
};

// Update a note
const updateNote = async (id, update) => {
  try {
    const { data } = await api.put(`/notes/${id}`, {
      ...update,
      location: {
        type: "Point",
        coordinates: [update.longitude || 0, update.latitude || 0]
      },
      radius: update.radius || 100,
      recipients: update.recipients || [],
      body: update.body || ""
    });
    return data;
  } catch (error) {
    console.error("Error updating note:", error);
    throw error;
  }
};

// Delete a note
const deleteNote = async (id) => {
  try {
    const { data } = await api.delete(`/notes/${id}`);
    return data;
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
};

export {
  fetchOneNote,
  fetchUsersNotes,
  fetchNotesByCurrentLocation,
  updateNote,
  deleteNote
};
