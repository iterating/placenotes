const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const users = require('./users.js')

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

modules.exports = router