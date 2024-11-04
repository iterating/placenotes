import User from "../models/User.js";
import Note from "../models/Note.js";
import { marked } from 'marked';
import { _id } from "../db/db.js";

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
  // Automatically add logged in user's email
  const note = new Note({
    _id: new _id(),
    userId: req.user._id,
    email: req.user.email,
    location: {
      lon: "1",
      lat: "1"
    },
    body: req.body.body,
    time: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(/[-:]/g, '').replace(' ', '-'),
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
    res.render("notesEdit", { note, marked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error finding note" });
  }
};

export async function updateNote(req, res) {
  try {
    const note = await Note.findOneAndUpdate(
      { userId: req.user._id, _id: req.params.id },
      { $set: { body: req.body.body } },
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

    const notes = await Note.find({
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

