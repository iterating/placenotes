import { marked } from "marked"
import * as NotesService from "../services/notes.service.js"

// notes
export const getNoteById = async (req, res) => {
  console.log("getNoteById called with req.params.id:", req.params.id)
  try {
    const note = await NotesService.getNoteById(req.params.id)
    if (!note) {
      console.log("No note found with id:", req.params.id)
      return res.status(404).send("Note not found")
    }
    console.log("Note found:", note._id)
    res.json(note)
  } catch (err) {
    console.error("Error retrieving note:", err)
    res.status(500).send("Error retrieving note")
  }
}

export const allNotes = async (req, res) => {
  try {
    const notes = await NotesService.allNotes()
    res.json(notes)
  } catch (err) {
    console.error(err)
    res.status(500).send("Error getting users")
  }
}
export const getNotes = async (req, res) => {
  console.log("getNotes called");
  try {
    const userId = req.user?._id;
    if (!userId) {
      console.error("No user ID found in request");
      return res.status(400).send({ error: "No user ID found" });
    }

    console.log("Fetching notes for user:", userId);
    const notes = await NotesService.getNotes(userId);
    
    if (!Array.isArray(notes)) {
      console.error("Invalid notes data returned from service");
      return res.status(500).send({ error: "Error retrieving notes" });
    }

    console.log(`Retrieved ${notes.length} notes for user ${userId}`);
    res.json(notes);
  } catch (err) {
    console.error("Error retrieving notes:", err);
    if (err.name === "CastError") {
      return res.status(400).send({ error: "Invalid user ID" });
    }
    res.status(500).json({ error: "Error retrieving notes" });
  }
}

export const newNoteForm = (req, res) =>
  res.json({
    note: {
      location: {
        coordinates: req.body?.location ?? [-118.243683, 34.052235],
      },
      radius: 200,
      time: "",
      body: "",
      recipients: req.body?.recipients ?? [],
    },
  })

export const newNote = async (req, res) => {
  try {
    const { body, location, radius, userId, email, tags } = req.body;

    // Validate the required fields
    if (!body || !location || !userId || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create the note with markdown content
    const note = await NotesService.newNote({
      body: body.trim(), // Store as markdown
      location,
      radius,
      userId,
      email,
      tags: tags || []
    });

    res.status(201).json(note);
  } catch (err) {
    console.error("Error creating note:", err);
    res.status(500).json({ error: "Error creating note", err });
  }
}

export const editNote = async (req, res) => {
  const note = await NotesService.getNoteById(req.params.id)
  if (!note) return res.status(404).json({ error: "Note not found" })
  res.json(note)
}

export const updateNote = async (req, res) => {
  console.log("updateNote called with req.params.id:", req.params.id);
  console.log("updateNote called with req.body:", req.body);
  try {
    // Validate coordinates
    const coordinates = req.body.location?.coordinates;
    if (!coordinates || 
        !Array.isArray(coordinates) || 
        coordinates.length !== 2 ||
        coordinates.some(coord => coord === null || coord === undefined || isNaN(coord))) {
      return res.status(400).json({ 
        error: "Invalid coordinates. Must be an array of two numbers [longitude, latitude]" 
      });
    }

    const note = await NotesService.updateNote({
      _id: req.params.id,
      body: req.body.body.trim(),
      location: {
        type: "Point",
        coordinates: coordinates.map(coord => Number(coord))
      },
      radius: Number(req.body.radius) || 1000,
      email: req.body.email,
      userId: req.body.userId,
      tags: req.body.tags || []
    });

    if (!note) {
      console.log("No note found with id:", req.params.id);
      return res.status(404).send("Note not found");
    }
    console.log("Updated note:", note);
    res.json(note);
  } catch (err) {
    console.error("Error updating note:", err);
    res.status(500).json({ error: "Error editing note", err });
  }
}



export const deleteNote = async (req, res) => {
  try {
    const note = await NotesService.deleteNote(req.params.id)
    if (!note) {
      return res.status(404).json({ error: "Note not found" })
    }
    res.json({ message: "Note deleted" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error deleting note" })
  }
}

export const getNoteByTime = async (req, res) => {
  try {
    const note = await NotesService.getNoteByTime({
      userId: req.user._id,
      time: req.params.time,
    })
    if (!note) {
      return res.status(404).send("Note not found")
    }
    res.json(note)
  } catch (err) {
    res.status(500).send("Error retrieving note")
  }
}

export const updateNoteByTime = async (req, res) => {
  try {
    const note = await NotesService.updateNoteByTime({
      userId: req.user._id,
      time: req.params.time,
      body: req.body,
    })
    if (!note) {
      return res.status(404).send("Note not found")
    }
    res.json(note)
  } catch (err) {
    res.status(500).send("Error editing note")
  }
}

export const deleteNoteByTime = async (req, res) => {
  try {
    const note = await NotesService.deleteNoteByTime({
      userId: req.user._id,
      time: req.params.time,
    })
    if (!note) {
      return res.status(404).send("Note not found")
    }
    res.json({ message: "Note deleted" })
  } catch (err) {
    res.status(500).send("Error deleting note")
  }
}

export const recentNotes = async (req, res) => {
  try {
    const notes = await NotesService.recentNotes(req.user._id)
    if (!notes || notes.length === 0) {
      return res.status(404).send("No notes found")
    }
    res.json(notes)
  } catch (err) {
    console.error(err)
    res.status(500).send("Error retrieving notes")
  }
}

export const oldestNotes = async (req, res) => {
  try {
    const notes = await NotesService.oldestNotes(req.user._id)
    if (!notes || notes.length === 0) {
      return res.status(404).send("No notes found")
    }
    res.json(notes)
  } catch (err) {
    console.error(err)
    res.status(500).send("Error retrieving notes")
  }
}

export const getNotesByLocation = async (req, res) => {
  try {
    const location = req.query.location ? JSON.parse(req.query.location) : null;
    if (!location) {
      return res.status(400).send("Location must be provided");
    }

    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).send("User not authenticated");
    }

    const notes = await NotesService.getNotesByLocation({
      userId,
      location
    });

    if (!notes || notes.length === 0) {
      return res.status(404).send("No notes found at the specified location");
    }
    res.json(notes);
  } catch (err) {
    console.error("Error retrieving notes:", err);
    if (err.message.includes('Invalid location format')) {
      return res.status(400).send(err.message);
    }
    res.status(500).send("Error retrieving notes");
  }
}

export const getNotesByCurrentLocation = async (req, res) => {
  try {
    const { lat, lon } = req.query
    if (lat == null || lon == null) {
      return res.status(400).send("Latitude and longitude must be provided")
    }
    const userId = req.user?._id
    if (!userId) {
      return res.status(401).send("User not authenticated")
    }
    const notes = await NotesService.getNotesByCurrentLocation({
      userId: userId,
      lon: Number(lon),
      lat: Number(lat),
    })
    if (!notes || notes.length === 0) {
      return res.status(404).send("No notes found at the specified location")
    }
    res.json(notes)
  } catch (err) {
    console.error("Error retrieving notes:", err)
    res.status(500).send("Error retrieving notes")
  }
}

export const searchNotes = async (req, res) => {
  console.log('[SearchNotes Controller] Received search request:', {
    query: req.query,
    user: req.user?._id,
    headers: req.headers
  });

  try {
    const { q: query } = req.query;
    const userId = req.user?._id;

    // Authentication check
    if (!userId) {
      console.error('[SearchNotes Controller] Unauthorized access attempt');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Query validation
    if (!query || query.trim().length < 2) {
      console.warn('[SearchNotes Controller] Invalid search query:', query);
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    console.log(`[SearchNotes Controller] Processing search:
      - User ID: ${userId}
      - Query: "${query}"
    `);

    // Search in note body and location name
    const notes = await NotesService.searchNotes({
      userId,
      query: query.trim(),
      limit: 20
    });

    console.log(`[SearchNotes Controller] Search completed:
      - Query: "${query}"
      - Results: ${notes.length}
      - Status: Success
    `);

    res.status(200).json({
      success: true,
      notes,
      metadata: {
        query,
        count: notes.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[SearchNotes Controller] Error processing search:', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      request: {
        query: req.query,
        user: req.user?._id
      }
    });

    // Send appropriate error response
    const statusCode = error.message.includes('Invalid user ID') ? 400 : 500;
    const errorMessage = statusCode === 400 ? error.message : 'Error searching notes';

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
