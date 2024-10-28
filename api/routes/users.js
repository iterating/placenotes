import express from "express";
const router = express.Router();
import mongoose from "mongoose";
import db from "../../db/conn.js";
import { ObjectId } from "mongodb";
import userSchema from "../models/users.js";
import notes from "./notes.js";
import passport from "../middleware/passport.js";
import bcrypt from "bcrypt";

router.get("/all", async (req, res) => {
    try {
        let users = await db.collection("users").find().toArray();
        res.send(users);
      } catch (err) {
        console.log(err);
        res.status(500).send("Error getting users");
      }
});

router.get("/:userId", async (req, res) => {
  try {
    let collection = await db.collection("users");
    let query = { _id: new ObjectId(req.params.userId) };
    let result = await collection.findOne(query);
    if (!result) res.send("User Not found").status(404);
    else res.send(result).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error getting user data");
  }
});

// Create user



export default router;
