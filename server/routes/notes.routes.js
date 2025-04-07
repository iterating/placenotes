import express from "express";
import { setUser } from "../api/middleware/auth.js";
import {
  getNoteById,
  allNotes,
  getNotes,
  newNoteForm,
  newNote,
  editNote,
  updateNote,
  deleteNote,
  getNoteByTime,
  updateNoteByTime,
  deleteNoteByTime,
  recentNotes,
  oldestNotes,
  getNotesByLocation,
  getNotesByCurrentLocation,
  searchNotes
} from "../controllers/notes.controllers.js";

const router = express.Router();

// Protect all routes
router.use(setUser);

// Note management routes
router.get("/all", allNotes);
router.get("/", getNotes);
router.get("/new", newNoteForm);
router.post("/new", newNote);
router.get("/edit/:id", editNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

// Time-based routes
router.get("/time/:time", getNoteByTime);
router.put("/time/:time", updateNoteByTime);
router.delete("/time/:time", deleteNoteByTime);

// Recent and oldest notes
router.get("/recent", recentNotes);
router.get("/oldest", oldestNotes);

// Location-based routes
router.get("/nearby", getNotesByLocation);
router.get("/location/:lat/:lon", getNotesByLocation);
router.get("/current-location", getNotesByCurrentLocation);

// Search route
router.get("/search", searchNotes);

export default router;
