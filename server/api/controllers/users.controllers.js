import express from "express";
import User from "../models/users.js";
import passport from "../middleware/passport.js";
import mongoose from "mongoose";

// New Account
export const allUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error getting users");
  }
};

export const renderSignUp = (req, res) => {
  res.render("signup", {
    errorMessage: req.flash("errorMessage"),
  });
};

export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    let errors = [];
    if (password.length < 2) {
      errors.push({ text: "Passwords must be at least 2 characters." });
    }

    if (errors.length > 0) {
      req.flash("errorMessage", errors);
      return res.redirect("/users/signup");
    }

    const newUser = new User({ email, password, _id: new mongoose.Types.ObjectId() });
    newUser.password = await newUser.encryptPassword(password);
    await newUser.save();
    req.flash("successMessage", "You are now registered and can log in");
    res.redirect("/users/login");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error registering user");
  }
};

// Log In
export const renderLogin = (req, res) => {
  console.log("Entering renderLogin route");
  console.log("req.session:", req.session);
  res.render("login", {
    errorMessage: req.flash("errorMessage"),
  });
};

export const login = passport.authenticate('local', {
  successRedirect: '/notes',
  failureRedirect: '/users/login',
  failureFlash: true,
});

export const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("successMessage", "You have been logged out");
    res.redirect("/users/login");
  });
};

