import express from "express";
import User from "../models/users.js";
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
export const signupForm = (req, res) => {
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
//!!q3 form validation here
    if (errors.length > 0) {
      req.flash("errorMessage", errors);
      return res.redirect("/users/signup");
    }

    const newUser = new User({ email, password, _id: new mongoose.Types.ObjectId() });

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
export const loginForm = (req, res) => {
  console.log("Entering loginForm route");
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

//!! Log in with email:com@com.com and password:com upon app start
export const autoLogin = async () => {
  try {
    const user = await User.findOne({ email: 'com@com.com' });
    if (user) {
      await user.comparePassword('com', (err, isMatch) => {
        if (isMatch) {
          console.log("Auto-logging in with email:com@com.com and password:com")
          user.login();
        } else {
          console.log("Auto-login failed");
        }
      });
    } else {
      console.log("No user found with email:com@com.com");
    }
  } catch (error) {
    console.error(error);
    console.log("Error auto-logging in");
  }
};
