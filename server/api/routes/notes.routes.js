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

// Note management routes (specific paths first)
router.get("/all", allNotes);
router.get("/", getNotes);
router.get("/new", newNoteForm);
router.post("/new", newNote);
router.get("/recent", recentNotes);
router.get("/oldest", oldestNotes);
router.get("/search", searchNotes);
router.get("/nearby", getNotesByLocation);
router.get("/current-location", getNotesByCurrentLocation);

router.get("/:id", getNoteById);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

// Time-based routes (must come after /:id)
router.get("/time/:time", getNoteByTime);
router.put("/time/:time", updateNoteByTime);
router.delete("/time/:time", deleteNoteByTime);

// Location-based routes with parameters (must come after /:id)
router.get("/location/:lat/:lon", getNotesByLocation);

// Edit form route (must come after /:id)
router.get("/edit/:id", editNote);

export default router;
