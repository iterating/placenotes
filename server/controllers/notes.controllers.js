import { marked } from "marked";
import { _id } from "../db/db.js";
import * as NotesService from "../services/notes.service.js";

// notes
export const allNotes = async (req, res) => {
  try {
    const notes = await NotesService.allNotes();
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error getting users");
  }
};

export const getNotes = async (req, res) => {
  try {
    const notes = await NotesService.getNotes(req.user._id);
    res.render("notes", { notes, marked: marked, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err,
    });
  }
};

export const newNoteForm = (req, res) => res.render("notesNew");

export const newNote = async (req, res) => {
  console.log("req.user._id:", req.user._id);
  const note = {
    userId: req.user._id,
    email: req.user.email,
    location: {
      lon: "1",
      lat: "1",
    },
    body: req.body.body,
    time: new Date()
      .toISOString()
      .replace(/T/, " ")
      .replace(/\..+/, "")
      .replace(/[-:]/g, "")
      .replace(" ", "-"),
  };

  try {
    const savedNote = await NotesService.newNote(note);
    res.redirect("/notes");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating note" });
  }
};

export const editNote = async (req, res) => {
  try {
    const note = await NotesService.getNoteById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.render("notesEdit", { note, marked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error finding note" });
  }
};

export async function updateNote(req, res) {
  try {
    const note = await NotesService.updateNote({
      userId: req.user._id,
      _id: req.params.id,
      body: req.body.body,
      time: req.body.time,
      location: {
        lon: req.body.lon,
        lat: req.body.lat,
      },
    });
    if (!note) {
      return res.status(404).send("Note not found");
    }
    res.redirect("/notes");
  } catch (err) {
    res.status(500).send("Error editing note");
  }
}

export const deleteNote = async (req, res) => {
  try {
    const note = await NotesService.deleteNote(req.params.id);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.redirect("/notes");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting note" });
  }
};

export async function getNoteByTime(req, res) {
  try {
    const note = await NotesService.getNoteByTime({
      userId: req.user._id,
      time: req.params.time,
    });
    if (!note) {
      return res.status(404).send("Note not found");
    }
    res.send(note);
  } catch (err) {
    res.status(500).send("Error retrieving note");
  }
}

export async function updateNoteByTime(req, res) {
  try {
    const note = await NotesService.updateNoteByTime(
      { userId: req.user._id, time: req.params.time },
      { $set: req.body },
      { new: true }
    );
    if (!note) {
      return res.status(404).send("Note not found");
    }
    res.send(note);
  } catch (err) {
    res.status(500).send("Error editing note");
  }
}

export async function deleteNoteByTime(req, res) {
  try {
    const note = await NotesService.deleteNoteByTime({
      userId: req.user._id,
      time: req.params.time,
    });
    if (!note) {
      return res.status(404).send("Note not found");
    }
    res.send({ message: "Note deleted" });
  } catch (err) {
    res.status(500).send("Error deleting note");
  }
}

export async function getNoteById(req, res) {
  try {
    const note = await NotesService.getNoteById(req.params.id);
    if (!note) {
      return res.status(404).send("Note not found");
    }
    res.send(note);
  } catch (err) {
    res.status(500).send("Error retrieving note");
  }
}

export async function getNotesByLocation(req, res) {
  try {
    const { lat, lon } = req.params;
    if (lat == null || lon == null) {
      return res.status(400).send("Latitude and longitude must be provided");
    }

    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).send("User not authenticated");
    }

    const notes = await NotesService.getNotesByLocation({
      userId: userId,
      "location.lat": Number(lat),
      "location.lon": Number(lon),
    });

    if (!notes || notes.length === 0) {
      return res.status(404).send("No notes found at the specified location");
    }

    res.send(notes);
  } catch (err) {
    console.error("Error retrieving notes:", err);
    res.status(500).send("Error retrieving notes");
  }
}
