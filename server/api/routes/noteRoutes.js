import express from "express";
import * as notesController from "../../controllers/notes.controllers.js";
import {  setUser } from "../middleware/auth.js";

const router = express.Router();

router.get("/all", notesController.allNotes);

router.get("/", setUser, (req, res, next) => {
  console.log("GET /notes (getNotes) called");
  console.log("req.user:", req.user);
  notesController.getNotes(req, res, next);
});

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

router.get("/age/recent", setUser, notesController.recentNotes);
router.get("/age/oldest", setUser, notesController.oldestNotes);



export default router;
