import { marked } from "marked"
import { _id } from "../db/db.js"
import * as NotesService from "../services/notes.service.js"

// notes
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
  try {
    //expecting array of notes
    const notes = await NotesService.getNotes(req.user._id)
    res.render("notes", { notes, marked, user: req.user })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      error: err.message,
    })
  }
}

export const newNoteForm = (req, res) => {
  const note = {
    userId: req.user._id,
    email: req.user.email,
    location: {
      type: "Point",
      coordinates: [req.body?.location ??  -118.243683, 34.052235],
    },
    radius: 100,
    time: "",
    body: "",
  }
  res.render("notesNew", {
    note,
    marked,
  })
}

export const newNote = async (req, res) => {
  console.log("req.user._id:", req.user._id)
  const location = JSON.parse(req.body.location)
  const note = {
    time: new Date(),
    userId: req.user._id,
    email: req.user.email,
    location: {
      type: "Point",
      coordinates: location.coordinates,
    },
    radius: req.body?.radius ?? 100,
    body: req.body.body,
    recipients: req.body?.recipients ?? [],
  }

  try {
    const savedNote = await NotesService.newNote(note)
    res.redirect("/notes")
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error creating note" })
  }
}

export const editNote = async (req, res) => {
  try {
    const note = await NotesService.getNoteById(req.params.id)
    if (!note) {
      return res.status(404).json({ error: "Note not found" })
    }
    console.log("editing note:", note)
    res.render("notesEdit", {
      note,
      marked,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error finding note" })
  }
}

export async function updateNote(req, res) {
  // Convert location string to object
  const location = JSON.parse(req.body.location)
  console.log("controller req.body:", req.body)
  // console.log("controller req.body.location:", req.body.location);
  try {
    const note = await NotesService.updateNote({
      _id: req.params.id,
      userId: req.user._id,
      location: {
        type: "Point",
        coordinates: location.coordinates,
      },
      radius: req.body.radius,
      time: req.body.time,
      body: req.body.body,
      email: req.user.email,
      recipients: req.body?.recipients ?? [],
    })
    console.log("controller note:", note)
    if (!note) {
      return res.status(404).send("Note not found")
    }
    res.redirect("/notes")
  } catch (err) {
    console.error(err)
    res.status(500).send("Error editing note")
  }
}

export const deleteNote = async (req, res) => {
  try {
    const note = await NotesService.deleteNote(req.params.id)
    if (!note) {
      return res.status(404).json({ error: "Note not found" })
    }
    res.redirect("/notes")
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error deleting note" })
  }
}

export async function getNoteByTime(req, res) {
  try {
    const note = await NotesService.getNoteByTime({
      userId: req.user._id,
      time: req.params.time,
    })
    if (!note) {
      return res.status(404).send("Note not found")
    }
    res.send(note)
  } catch (err) {
    res.status(500).send("Error retrieving note")
  }
}

export async function updateNoteByTime(req, res) {
  try {
    const note = await NotesService.updateNoteByTime({
      userId: req.user._id,
      time: req.params.time,
      body: req.body,
    })
    if (!note) {
      return res.status(404).send("Note not found")
    }
    res.send(note)
  } catch (err) {
    res.status(500).send("Error editing note")
  }
}

export async function deleteNoteByTime(req, res) {
  try {
    const note = await NotesService.deleteNoteByTime({
      userId: req.user._id,
      time: req.params.time,
    })
    if (!note) {
      return res.status(404).send("Note not found")
    }
    res.send({ message: "Note deleted" })
  } catch (err) {
    res.status(500).send("Error deleting note")
  }
}

export async function getNoteById(req, res) {
  try {
    const note = await NotesService.getNoteById(req.params.id)
    if (!note) {
      return res.status(404).send("Note not found")
    }
    res.send(note)
  } catch (err) {
    res.status(500).send("Error retrieving note")
  }
}

export async function getNotesByLocation(req, res) {
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

    res.send(notes)
  } catch (err) {
    console.error("Error retrieving notes:", err)
    res.status(500).send("Error retrieving notes")
  }
}
