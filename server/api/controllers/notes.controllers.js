import passport from "passport";
import Note from "../models/notes.js";

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
    const notes = await Note.find();
    res.render("notes", { notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err,
    });
  }
};
