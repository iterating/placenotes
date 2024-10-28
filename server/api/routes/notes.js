import express from "express"
const router = express.Router()
import { renderNotes, allNotes, newNoteForm, newNote, editNote, deleteNote } from "../controllers/notes.controllers.js";
import Note from "../models/notes.js";
import users from "./users.js"
import { isAuthenticated } from "../middleware/auth.js" 
import {setUser} from "../middleware/auth.js"

router.get("/", setUser, renderNotes);

router.get("/all", allNotes);

router.get("/new", newNoteForm);
router.post("/new", newNote);

router.put("/:id", editNote);
router.delete("/:id", deleteNote);

export default router
