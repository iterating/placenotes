import express from "express";
const router = express.Router();
import {
  allNotes,
  renderNotes,
  deleteNote,
  editNote,
  newNoteForm,
  newNote,
  getNoteByTime,
  updateNoteByTime,
  deleteNoteByTime,
  getNotesByLocation,
  updateNote,
  getNoteById,
} from "../controllers/notes.controllers.js";
import Note from "../models/Notes.js";
import users from "./users.js";
import { autoLogin, setUser } from "../middleware/auth.js";

router.get("/all", allNotes);
router.get("/", setUser, renderNotes);


router.route("/new").get(setUser, newNoteForm).post(setUser, newNote);
router
  .route("/:id")
  .get( getNoteById)
  .put(setUser, updateNote)
router.route("/:id/delete") 
  .post(setUser, deleteNote);
router.route("/:id/edit").get(setUser, editNote).post(setUser, updateNote);
router
  .route("/:time")
  .get(setUser, getNoteByTime)
  .put(setUser, updateNoteByTime)
  .delete(setUser, deleteNoteByTime);

router.route("/:location").get(setUser, getNotesByLocation);




export default router;
