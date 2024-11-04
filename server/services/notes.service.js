
// services/notes.service.js
import Note from "../models/Note.js";

export const createNote = async (note) => {
  try {
    const savedNote = await note.save();
    return savedNote;
  } catch (err) {
    throw err;
  }
};

export const getNotes = async (userId) => {
  try {
    const notes = await Note.find({ userId });
    return notes;
  } catch (err) {
    throw err;
  }
};

export const getNoteById = async (id) => {
  try {
    const note = await Note.findById(id);
    return note;
  } catch (err) {
    throw err;
  }
};

export const getNotesByLocation = async (userId, lat, lon) => {
  try {
    const notes = await Note.find({
      userId: userId,
      "location.lat": Number(lat),
      "location.lon": Number(lon),
    });
    return notes;
  } catch (err) {
    throw err;
  }
};
