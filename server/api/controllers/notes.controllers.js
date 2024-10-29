import passport from "passport";
import Note from "../models/notes.js";
import mongoose from "mongoose";
import User from "../models/users.js";


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
    time: Date.now(),
  });

  try {
    const savedNote = await note.save();
    res.redirect("/notes");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating note" });
  }
};

export const  editNote = async (req, res) => {
}
export const deleteNote = async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  req.flash("success_msg", "Note Deleted");
  res.redirect("/notes");
};

const autoLogin = async () => {
  try {
    const user = await User.findOne({ email: 'com@com.com' });
    if (user) {
      await user.comparePassword('com', (err, isMatch) => {
        if (isMatch) {
          console.log("Auto-logging in with email:com@com.com and password:com")
          user.login();
        } else {
          console.log("Auto-login failed");
        }
      });
    } else {
      console.log("No user found with email:com@com.com");
    }
  } catch (error) {
    console.error(error);
    console.log("Error auto-logging in");
  }
};