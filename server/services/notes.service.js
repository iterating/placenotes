// services/notes.service.js
import Note from "../models/Note.js";
import { _id } from "../db/db.js";

export const allNotes = async () => {
    return await Note.find();
};

export const getNotes = async (userId) => {
  return await Note.find({ userId });
};

export const newNote = async (noteData) => {
  console.log("userId:", noteData.userId);
  const note = new Note({
    _id: _id(),
    userId: noteData.userId,
    email: noteData.email,
    location: noteData.location,
    radius: noteData.radius,
    body: noteData.body,
    time: noteData.time,
  });

  try {
    const savedNote = await Note.create(note);
    return savedNote;
  } catch (err) {
    console.error(err);
    throw new Error("Error creating note");
  }
};

export const editNote = async (id) => {
  return await Note.findById(id);
};

export const updateNote = async (note) => {
  try {
    const updatedNote = await Note.findOneAndUpdate(
      { _id: note._id },
      {
        $set: {
          body: note.body,
          email: note.email,
          userId: note.userId,
          date: Date(),
          
        },
      },
      { new: true }
    );
    return updatedNote;
  } catch (err) {
    throw err;
  }
};

export const deleteNote = async (id) => {
  try {
    const note = await Note.findByIdAndDelete(id);
    return note;
  } catch (err) {
    console.error(err);
    throw new Error("Error deleting note");
  }
};

export const getNoteByTime = async (userId, time) => {
  try {
    const note = await Note.findOne({
      userId,
      time,
    });
    return note;
  } catch (err) {
    throw err;
  }
};

export const updateNoteByTime = async (userId, time, body) => {
  try {
    const note = await Note.findOneAndUpdate(
      { userId, time },
      { $set: { body } },
      { new: true }
    );
    return note;
  } catch (err) {
    throw err;
  }
};

export const deleteNoteByTime = async (userId, time) => {
  try {
    const note = await Note.findOneAndDelete({
      userId,
      time,
    });
    return note;
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
      userId,
      "location.lat": Number(lat),
      "location.lon": Number(lon),
    });
    return notes;
  } catch (err) {
    throw err;
  }
};

export default {};
