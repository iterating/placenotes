import express from "express"
const router = express.Router()
import mongoose from 'mongoose';
import users from "./users.js"

router.get('/', async (req, res) => {
try {
    let collection = await db.collection("notes");
    let result = await collection.findOne();
    if (!result) res.send("Not found").status(404);
    else res.send(result).status(200);
} catch (err) {
    console.error(err);
    res.status(500).send("Error getting note data");
}
})

export default router