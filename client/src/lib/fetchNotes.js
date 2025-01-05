import apiClient from './apiClient';
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
  if (!token || !id) {
    console.error("Token and note ID are required");
    throw new Error("Missing required parameters");
  }

  try {
    const { data } = await apiClient.get(`/notes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!data || !data._id) {
      throw new Error("Note not found");
    }
    return data;
  } catch (error) {
    console.error("Error fetching note:", error);
    throw error;
  }
};

// Fetch all notes for the user
const fetchUsersNotes = async (token, setNotes, setUserId) => {
  if (!token) {
    console.error("Token is required");
    throw new Error("Authentication required");
  }

  try {
    const { data } = await apiClient.get(`/notes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!Array.isArray(data)) {
      throw new Error("Invalid response format");
    }

    const notes = data.map(note => ({ ...note, showFullNote: false }));
    setNotes(notes);
    if (notes.length) setUserId(notes[0].userId);
  } catch (error) {
    console.error("Error fetching user notes:", error);
    throw error;
  }
};

// Fetch notes by current location
const fetchNotesByCurrentLocation = async (token, setNotes, setUserId, { latitude: lat, longitude: lon }) => {
  if (!token) {
    console.error("Token is required");
    throw new Error("Authentication required");
  }

  const { latitude, longitude } = validateCoordinates(lat, lon);

  try {
    const response = await apiClient.get(`/notes/location/current?lat=${latitude}&lon=${longitude}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!Array.isArray(response.data)) {
      throw new Error("Invalid response format");
    }

    const notes = response.data.map(note => ({
      ...note,
      showFullNote: false,
    }));

    setNotes(notes);
    if (notes.length > 0) {
      setUserId(notes[0].userId);
    }
  } catch (error) {
    console.error("Error fetching notes by location:", error);
    throw error;
  }
};

// Update a note
const updateNote = async (token, id, update) => {
  if (!token || !id || !update) {
    console.error("Token, note ID, and update data are required");
    throw new Error("Missing required parameters");
  }

  try {
    const { data } = await apiClient.put(`/notes/${id}`, update, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!data || !data._id) {
      throw new Error("Failed to update note");
    }

    return data;
  } catch (error) {
    console.error("Error updating note:", error);
    throw error;
  }
};

// Delete a note
const deleteNote = async (token, id) => {
  if (!token || !id) {
    console.error("Token and note ID are required");
    throw new Error("Missing required parameters");
  }

  try {
    const { data } = await apiClient.delete(`/notes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
};

export { fetchOneNote, fetchUsersNotes, fetchNotesByCurrentLocation, updateNote, deleteNote };
