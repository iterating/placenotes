import express from 'express';
import passport from 'passport';
import User from "../models/users.js";

// New Account

export const renderSignUp = (req, res) => {
  res.render("signup");
}

export const signup = async (req, res) => {
  const { email, password } = req.body;
  
  let errors = [];
  if (password.length < 1) {
    errors.push({ text: "Passwords must be at least 2 characters." });
  }

  if (errors.length > 0) {
    return res.render("/signup", {
      email,
      password,
    });
  }
  const newUser = new User({ email, password });
  newUser.password = await newUser.encryptPassword(password);
  await newUser.save();
  req.flash("successMessage", "You are now registered and can log in");
  res.redirect("/login");
}


// Log In
export const renderLogin = (req, res) => {
  res.render("login");
}

export const login = passport.authenticate("local", {
  successRedirect: "/notes",
  failureRedirect: "/login",
  failureFlash: true,
});


export const logout = async (req, res, next) => {
  await req.logout((err) => {
    if (err) return next(err);
    req.flash("successMessage", "You have been logged out");
    res.redirect("/login");
  });
};
