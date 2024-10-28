import express from "express"
const router = express.Router()
import { renderNotes, allNotes } from "../controllers/notes.controllers.js";
import db from "../../db/conn.js";
import Note from "../models/notes.js";
import users from "./users.js"
import { isAuthenticated } from "../middleware/auth.js" 

router.get("/", renderNotes);


router.get("/all", allNotes);





export default router
