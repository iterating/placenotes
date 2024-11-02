import express from "express";
import User from "../models/Users.js";
import Note from "../models/Notes.js";
import passport from "../middleware/passport.js";
import mongoose from "mongoose";

//!! Change for production //!!
export const allUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error getting users");
  }
};
// user/login endpoint GETs sign in form and POSTs new user account


//!! Log in with email:com@com.com and password:com upon app start

