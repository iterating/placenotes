import express from "express";
import { setUser } from "../middleware/auth.js";
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
} from "../../controllers/notes.controllers.js";

const router = express.Router();

// Test route - does not require authentication, define before router.use(setUser)
router.get("/test-nearby", (req, res) => {
  console.log("TEST route called with query params:", req.query); // Keep log for test route
  res.status(200).json({ success: true, message: "Test route working" });
});

// Protect all routes
router.use(setUser);

// Note management routes
router.get("/all", allNotes);
router.get("/", getNotes);
router.get("/new", newNoteForm);
router.post("/new", newNote);
router.get("/edit/:id", editNote);
// CRUD by ID (GET must come after specific paths like /new, /search, /recent etc.)
router.get("/:id", getNoteById);
router.put("/:id", updateNote); // Existing
router.delete("/:id", deleteNote); // Existing

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
