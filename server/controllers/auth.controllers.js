import db from "../db/db.js";
import express from "express";
import User from "../models/Users.js";
import Note from "../models/Notes.js";
import passport from "../middleware/passport.js";
import mongoose from "mongoose";
 
export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    let errors = [];
    if (password.length < 2) {
      errors.push({ text: "Passwords must be at least 2 characters." });
    }
    //!!q3 form validation here
    if (errors.length > 0) {
      req.flash("errorMessage", errors);
      return res.redirect("/users/signup");
    }

    const newUser = new User({
      email,
      password,
      _id: new mongoose.Types.ObjectId(),
    });

    newUser.password = await newUser.encryptPassword(password);
    await newUser.save();
    req.flash("successMessage", "You are now registered");
    // Automatically log in the new user
    req.login(newUser, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error logging in user after registration");
      }
      res.redirect("/notes");
    });
  } catch (error) {
    console.error(error); 
    res.status(500).send("Error registering user");
  }
};

// Log In


export const login = passport.authenticate("local", {
  successRedirect: "/notes",
  failureRedirect: "/users/login",
  failureFlash: true,
});



export const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("successMessage", "You have been logged out");
    res.redirect("/users/login");
  });
};
