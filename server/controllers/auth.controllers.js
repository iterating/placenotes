import * as authService from "../services/auth.service.js";
import passport from "../api/middleware/passport.js";
import jwt from "jsonwebtoken";
import axios from "axios";

export const generateToken = (user) => {
  const payload = {
    _id: user._id,
    email: user.email,
  };
  const secret = process.env.JWT_SECRET || "defaultSecretKey";
  const options = { expiresIn: "1h" };
  return jwt.sign(payload, secret, options);
};

export const refreshToken = async (token) => {
  try {
    const decoded = jwt.decode(token);
    const { _id, email } = decoded;
    const newToken = generateToken({ _id, email });
    return newToken;
  } catch (err) {
    return null;
  }
};

export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authService.signup({ email, password });
    req.flash("successMessage", "User registered");
    req.logIn(user, (err) => {
      if (err) console.error("Error logging in user", err);
      const token = generateToken({ _id: user._id, email: user.email });
      req.session.user = user; // Update the req.session object with the user's data
      req.session.token = token;
      res.json({ success: true, user, token });
    });
  } catch (error) {
    req.flash("errorMessage", "Error registering user");
    res.redirect("/users/signup");
  }
};

export const login = async (req, res) => {
  passport.authenticate("localLogin", (err, user, info) => {
    if (err) {
      console.error("Error during authentication", err);
    }
    if (!user) {
      console.log("No user found");
      req.flash("errorMessage", info.message);
      return res.redirect("/users/login");
    }

    console.log("User found. Logging in.");
    req.logIn(user, (err) => {
      if (err) {
        console.error("Error logging in user", err);
      }

      console.log("Generating token for user.");
      const token = generateToken({ _id: user._id, email: user.email });

      console.log("Updating req.session object with the user's data");
      req.session.user = user;
      req.session.token = token;

      console.log("Returning the token explicitly.");
      return res.json({ success: true, user, token });
    });
  })(req, res);
};

export const logout = (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect("/users/login");
};

