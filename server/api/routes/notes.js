import express from "express"
const router = express.Router()
import { renderNotes, allNotes, newNoteForm, newNote, editNote, deleteNote } from "../controllers/notes.controllers.js";
import Note from "../models/notes.js";
import users from "./users.js"
import {setUser, autoLogin} from "../middleware/auth.js"

router.get("/", setUser, renderNotes);

router.get("/all", setUser, allNotes);

router.get("/new", setUser, newNoteForm);
router.post("/new", setUser, newNote);

router.put("/:id", setUser, editNote);
router.delete("/:id", setUser, deleteNote);

export default router
