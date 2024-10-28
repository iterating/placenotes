import passport from "passport";
import Note from "../models/notes.js";
import mongoose from "mongoose";

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
export const renderNoteForm = (req, res) => res.render("notesNew");

export const newNote = async (req, res) => {
  const { userId, location, time, body } = req.body;
  const email = req.user.email; // Automatically add logged in user's email

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
    res.status(500).json({ error: 'Error creating note' });
  }
};

