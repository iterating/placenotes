import express from "express";
const router = express.Router();
import * as notesController from "../../controllers/notes.controllers.js";
import Note from "../../models/Note.js";
import {  setUser } from "../middleware/auth.js";

router.get("/all", notesController.allNotes);
router.get("/", setUser, notesController.renderNotes);


router.route("/new").get(setUser, notesController.newNoteForm).post(setUser, notesController.newNote);
router
  .route("/:id")
  .get( notesController.getNoteById)
  .put(setUser, notesController.updateNote)
router.route("/:id/delete") 
  .post(setUser, notesController.deleteNote);
router.route("/:id/edit").get(setUser, notesController.editNote).post(setUser, notesController.updateNote);
router
  .route("/time/:time")
  .get(setUser, notesController.getNoteByTime)
  .put(setUser, notesController.updateNoteByTime)
  .delete(setUser, notesController.deleteNoteByTime);

router.route("/location/:lat/:lon").get(setUser, notesController.getNotesByLocation);




export default router;
