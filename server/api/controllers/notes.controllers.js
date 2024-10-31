import passport from "passport";
import Note from "../models/notes.js";
import mongoose from "mongoose";
import User from "../models/users.js";
import { autoLogin } from "../middleware/auth.js";


// notes
export const allNotes = (req, res) => {
  Note.find()
    .then((notes) => {
      res.json(notes);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error getting users");
    });
};

export const renderNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user._id });
    res.render("notes", { notes, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err,
    });
  }
};



export const newNoteForm = (req, res) => res.render("notesNew");

export const newNote = async (req, res) => {
  // Automatically add logged in user's email
  const note = new Note({
    _id: new mongoose.Types.ObjectId(),
    userId: req.user._id,
    email: req.user.email,
    location: {
      lon: "1",
      lat: "1"
    },
    body: req.body.body,
    time: new Date().toISOString(),
  });

  try {
    const savedNote = await note.save();
    res.redirect("/notes");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating note" });
  }
};

export const editNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.render("notesEdit", { note });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error finding note" });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
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
    const note = await Note.findOne({ userId: req.user._id, time: req.params.time });
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
    const note = await Note.findOneAndUpdate(
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
    const note = await Note.findOneAndDelete({ userId: req.user._id, time: req.params.time });
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
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Note not found");
    }
    res.send(note);
  } catch (err) {
    res.status(500).send("Error retrieving note");
  }
}

export async function updateNote(req, res) {
  try {
    const note = await Note.findOneAndUpdate(
      { userId: req.user._id, _id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!note) {
      return res.status(404).send("Note not found");
    }
    res.redirect("/notes");
  } catch (err) {
    res.status(500).send("Error editing note");
  }
}

export async function getNotesByLocation(req, res) {
  try {
    const notes = await Note.find({ userId: req.user._id, location: req.params.location });
    res.send(notes);
  } catch (err) {
    res.status(500).send("Error retrieving notes");
  }
}

