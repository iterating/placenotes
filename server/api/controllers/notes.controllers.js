import passport from "passport";
import Note from "../models/notes.js";
import mongoose from "mongoose";

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
  const email = req.user.email; 

  const note = new Note({
    _id: new mongoose.Types.ObjectId(),
    userId,
    email,
    location,
    time,
    body,
  });

  try {
    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating note" });
  }
};

export const  editNote = async (req, res) => {
}
export const deleteNote = async (req, res) => {
}