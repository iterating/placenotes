import express from "express";
import * as notesController from "../../controllers/notes.controllers.js";
import { setUser } from "../middleware/auth.js";
const router = express.Router();

// Get all notes (admin only)
router.get("/all", setUser, (req, res, next) => {
  console.log("GET /notes/all called");
  notesController.allNotes(req, res, next);
});

// Get user's notes
router.get("/", setUser, (req, res, next) => {
  console.log("GET /notes (getNotes) called");
  console.log("req.user:", req.user);
  notesController.getNotes(req, res, next);
});

// Create new note
router.post("/new", setUser, (req, res, next) => {
  console.log("POST /notes/new called");
  notesController.newNote(req, res, next);
});

// Get notes by location
router.route("/location/current")
  .get(setUser, notesController.getNotesByCurrentLocation);

// Get notes by specific location
router.route("/location/:lat/:lon")
  .get(setUser, notesController.getNotesByLocation);

// Get notes near a location
router.route("/nearby")
  .get(setUser, notesController.getNotesByLocation);

// Get notes by time
router.route("/time/:time")
  .get(setUser, notesController.getNoteByTime);

// Get notes by age
router.get("/age/recent", setUser, notesController.recentNotes);
router.get("/age/oldest", setUser, notesController.oldestNotes);

// Get, update, delete note by ID (must be last to avoid catching other routes)
router.route("/:id")
  .get(setUser, notesController.getNoteById)
  .put(setUser, notesController.updateNote)
  .delete(setUser, notesController.deleteNote);

export default router;
