import Note from "../models/Note.js"
import { _id } from "../db/db.js"
import mongoose from "mongoose"
import { isConnectedToDb } from "../db/conn.js"

const checkConnection = () => {
  if (!isConnectedToDb()) {
    throw new Error('Database connection is not ready');
  }
};

export const allNotes = async () => {
  checkConnection();
  return Note.find();
}

export const getNotes = async (userId) => {
  console.log(`Services: Fetching notes for user: ${userId}`);
  try {
    checkConnection();
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    const notes = await Note.find({ userId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    console.log(`Services: Found ${notes.length} notes for user ${userId}`);
    return notes;
  } catch (error) {
    console.error(`Error fetching notes for user ${userId}:`, error.message);
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

export const getNotesByLocation = async ({ userId, location }) => {
  checkConnection();
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID format');
    }

    if (!location || !location.type || location.type !== 'Point' || !Array.isArray(location.coordinates)) {
      throw new Error('Invalid location format. Expected GeoJSON Point object');
    }

    const [longitude, latitude] = location.coordinates;
    if (isNaN(longitude) || isNaN(latitude) || 
        longitude < -180 || longitude > 180 || 
        latitude < -90 || latitude > 90) {
      throw new Error('Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90');
    }

    const query = {
      userId,
      location: {
        $near: {
          $geometry: location,
          $maxDistance: 5000 // 5km radius
        }
      }
    };

    console.log('Executing geospatial query:', JSON.stringify(query, null, 2));
    
    const notes = await Note.find(query).lean().exec();
    console.log(`Found ${notes.length} notes near location`);
    
    return notes;
  } catch (error) {
    console.error('Error getting notes by location:', error);
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

export const searchNotes = async ({ userId, query, limit = 20 }) => {
  console.log(`[SearchNotes] Starting search for user ${userId} with query: "${query}"`);
  try {
    checkConnection();
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error(`[SearchNotes] Invalid user ID: ${userId}`);
      throw new Error('Invalid user ID');
    }

    if (!query || typeof query !== 'string') {
      console.error(`[SearchNotes] Invalid query: ${query}`);
      throw new Error('Search query must be a non-empty string');
    }

    console.log(`[SearchNotes] Executing search with criteria:
      - User ID: ${userId}
      - Query: "${query}"
      - Limit: ${limit}
    `);

    const searchResults = await Note.find({
      userId,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { body: { $regex: query, $options: 'i' } },
        { locationName: { $regex: query, $options: 'i' } }
      ]
    })
    .sort({ time: -1 })
    .limit(limit)
    .lean()
    .exec();

    console.log(`[SearchNotes] Found ${searchResults.length} results for query "${query}"`);

    if (searchResults.length === 0) {
      console.log(`[SearchNotes] No results found for query "${query}"`);
    } else {
      console.log(`[SearchNotes] Results summary:
        - Total results: ${searchResults.length}
        - First result title: "${searchResults[0].title || 'Untitled'}"
        - Last result title: "${searchResults[searchResults.length - 1].title || 'Untitled'}"
      `);
    }

    return searchResults;
  } catch (error) {
    console.error('[SearchNotes] Error during search:', {
      userId,
      query,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });
    throw error;
  }
};

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
  deleteUserNote,
  searchNotes
};
