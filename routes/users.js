const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const notes = require ('./notes.js')
 
router.get('/:userId', async (req, res) => {
    try{

    
    let collection = await db.collection("users");
    let query = req.params.userId

    let result = await collection.findOne(query);
    if (!result) res.send("User Not found").status(404);
    else res.send(result).status(200);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error getting user data");
    }

})

modules.exports = router
