import express from "express"
const router = express.Router()
import mongoose from 'mongoose';
import db from "../../db/conn.js";
import { ObjectId } from "mongodb";
import noteSchema from "../models/notes.js";
import users from "./users.js"

router.get("/all", async (req, res) => {
    try {
        let notes = await db.collection("notes").find().toArray();
        res.send(notes);
      } catch (err) {
        console.log(err);
        res.status(500).send("Error getting notes");
      }
});

router.get('/:noteId', async (req, res) => {
try {
    let collection = await db.collection("notes");
    let query = { _id: new ObjectId(req.params.noteId) };
    let result = await collection.findOne(query);
    if (!result) res.send("Not found").status(404);
    else res.send(result).status(200);
} catch (err) {
    console.error(err);
    res.status(500).send("Error getting note data");
}
})

//

export default router