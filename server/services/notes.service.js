import Note from "../models/Note.js"
import { _id } from "../db/db.js"
import mongoose from "mongoose"

const checkConnection = () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database connection is not ready');
  }
};

export const allNotes = async () => {
  checkConnection();
  return Note.find();
}

export const getNotes = async (userId) => {
  console.log(`services fetching notes for user: ${userId}`);
  try {
    checkConnection();
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID format');
    }

    const notes = await Note.find({ userId })
      .sort({ updatedAt: -1 })
      .lean()
      .exec();
    
    console.log(`services retrieved ${notes.length} notes for user with ID: ${userId}`);
    return notes;
  } catch (error) {
    console.error(`Error fetching notes for user with ID: ${userId}:`, error.message);
    throw error;
  }
}

export const recentNotes = async (userId) => {
  checkConnection();
  return Note.find({ userId }).sort({ time: -1 }).limit(20);
}

export const oldestNotes = async (userId) => {
  checkConnection();
  return Note.find({ userId }).sort({ time: 1 }).limit(20);
}

export const newNote = async (noteData) => {
  checkConnection();
  return Note.create({ _id: _id(), ...noteData });
}

export const editNote = async (id) => {
  checkConnection();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid note ID format');
  }
  return Note.findById(id);
}

export const updateNote = async (note) => {
  console.log(`services updating note with ID: ${note._id}`);
  try {
    checkConnection();
    
    if (!mongoose.Types.ObjectId.isValid(note._id)) {
      throw new Error('Invalid note ID format');
    }

    const updatedNote = await Note
      .findOneAndUpdate(
        { _id: note._id },
        { $set: { ...note, updatedAt: new Date() } },
        { new: true, runValidators: true }
      )
      .lean()
      .exec();

    if (!updatedNote) {
      throw new Error('Note not found');
    }

    return updatedNote;
  } catch (error) {
    console.error(`Error updating note with ID ${note._id}:`, error.message);
    throw error;
  }
}

export const deleteNote = async (id) => {
  checkConnection();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid note ID format');
  }
  return Note.findByIdAndDelete(id);
}

export const getNoteByTime = async ({ userId, time }) => {
  checkConnection();
  return Note.findOne({ userId, time });
}

export const updateNoteByTime = async ({ userId, time, body }) => {
  checkConnection();
  return Note.findOneAndUpdate(
    { userId, time },
    { $set: { body, updatedAt: new Date() } },
    { new: true }
  );
}

export const deleteNoteByTime = async ({ userId, time }) => {
  checkConnection();
  return Note.findOneAndDelete({ userId, time });
}

export const getNoteById = async (id) => {
  checkConnection();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid note ID format');
  }
  return Note.findById(id);
}

export const getNotesByLocation = async ({ userId, lat, lon }) => {
  checkConnection();
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID format');
    }

    return Note.find({
      userId,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lon, lat]
          },
          $maxDistance: 1000
        }
      }
    }).lean().exec();
  } catch (error) {
    console.error('Error getting notes by location:', error.message);
    throw error;
  }
}

export const getUserNotes = (userId) =>
  Note.find({ userId })

export const getUserNoteById = (userId, noteId) =>
  Note.findOne({ userId, _id: noteId })

export const updateUserNote = (userId, noteId, update) =>
  Note.findOneAndUpdate({ userId, _id: noteId }, { $set: update }, { new: true })

export const deleteUserNote = (userId, noteId) =>
  Note.findOneAndDelete({ userId, _id: noteId })

export default {
  allNotes,
  getNotes,
  recentNotes,
  oldestNotes,
  newNote,
  editNote,
  updateNote,
  deleteNote,
  getNoteByTime,
  updateNoteByTime,
  deleteNoteByTime,
  getNoteById,
  getNotesByLocation,
  getUserNotes,
  getUserNoteById,
  updateUserNote,
  deleteUserNote
};
