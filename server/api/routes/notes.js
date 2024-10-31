import express from "express"
const router = express.Router()
import { renderNotes, allNotes, newNoteForm, newNote, editNote, deleteNote } from "../controllers/notes.controllers.js";
import Note from "../models/notes.js";
import users from "./users.js"
import {setUser, autoLogin} from "../middleware/auth.js"

router.get("/", setUser, renderNotes);
router.get("/all", allNotes);
router.get("/new", setUser, newNoteForm);
router.post("/new", setUser, newNote);
router.put("/:id", setUser, editNote);
router.delete("/:id", setUser, deleteNote);

router.get("/:time", setUser, (req, res) => {
  Note.findOne({ userId: req.user._id, time: req.params.time })
    .then((notes) => {
      res.send(notes);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving notes");
    });
})
router.put("/:time", setUser, (req, res) => {
  Note.findOneAndUpdate(
    { userId: req.user._id, time: req.params.time },
    { $set: req.body },
    { new: true }
  )
    .then((notes) => {
      res.send(notes);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error editing note");
    });
})

router.delete("/:time", setUser, (req, res) => {
  Note.findOneAndDelete(
    { userId: req.user._id, time: req.params.time }
  )
    .then((notes) => {
      res.send({ message: "Note deleted" });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error deleting note");
    });
})

router.get("/:location", setUser, (req, res) => {
  Note.find({ userId: req.user._id, location: req.params.location })
    .then((notes) => {
      res.send(notes);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving notes");
    });
})


export default router
