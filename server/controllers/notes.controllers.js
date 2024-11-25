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
  console.log("getNotes called")
  try {
    const userId = req.user?._id
    if (!userId) {
      console.error("No user ID found in request")
      return res.status(400).send({ error: "No user ID found" })
    }
    console.log("controller fetching notes for user:", userId)
    const notes = await NotesService.getNotes(userId)
    if (!Array.isArray(notes) || notes.length === 0) {
      console.log("No notes found for user:", userId)
    } else {
      console.log("controller notes successfully retrieved for user:", userId)
    }
    res.json(notes)
  } catch (err) {
    console.error("Error retrieving notes:", err)
    if (err.name === "CastError") {
      return res.status(400).send({ error: "Invalid user ID" })
    }
    res.status(500).json({ error: "Error retrieving notes" })
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
    const location = JSON.parse(req.body.location)
    const note = await NotesService.newNote({
      userId: req.user._id,
      email: req.user.email,
      location: {
        type: "Point",
        coordinates: location.coordinates,
      },
      radius: req.body?.radius ?? 200,
      body: req.body.body,
      // `recipients:req.body?.recipients??[]` creates empty string, not array
      recipients: req.body?.recipients ? JSON.parse(req.body.recipients) : [],
    })
    res.json(note)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error creating note" })
  }
}

export const editNote = async (req, res) => {
  const note = await NotesService.getNoteById(req.params.id)
  if (!note) return res.status(404).json({ error: "Note not found" })
  res.json(note)
}

export const updateNote = async (req, res) => {
  
  try {
    // const location = JSON.parse(req.body.location)
    const note = await NotesService.updateNote({
      _id: req.params.id,
      body: req.body.body,
      location: {
        type: "Point",
        coordinates: req.body.location.coordinates || [-118.243685, 34.052236],
      },
      recipients: req.body.recipients || [],
      radius: req.body.radius || 200,
    })
    if (!note) {
      return res.status(404).send("Note not found")
    }
    res.json(note)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error editing note", err })
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
    const { lat, lon } = req.params
    if (lat == null || lon == null) {
      return res.status(400).send("Latitude and longitude must be provided")
    }
    const userId = req.user?._id
    if (!userId) {
      return res.status(401).send("User not authenticated")
    }
    const notes = await NotesService.getNotesByLocation({
      userId: userId,
      "location.lat": Number(lat),
      "location.lon": Number(lon),
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
      lat: Number(lat),
      lon: Number(lon),
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

