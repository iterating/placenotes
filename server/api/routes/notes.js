import express from "express"
const router = express.Router()
import { renderNotes, allNotes, renderNoteForm, newNote } from "../controllers/notes.controllers.js";
import db from "../../db/conn.js";
import Note from "../models/notes.js";
import users from "./users.js"
import { isAuthenticated } from "../middleware/auth.js" 
import {setUser} from "../middleware/auth.js"

router.get("/", setUser, renderNotes);


router.get("/all", allNotes);

router.get("/add", renderNoteForm);

router.post("/new", newNote);

export default router
