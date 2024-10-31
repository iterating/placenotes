export const setUser = (req, res, next) => {
  if (req.user && req.user._id && req.user.email) {
    res.locals.user = { _id: req.user._id, email: req.user.email };
    next();
  } else {
    res.render("login", {
      errorMessage: "Please log in to access this page.",
    });
  }
};

import User from "../models/users.js";
import bcrypt from "bcrypt";
export const autoLogin = async () => {
  try {
    const user = await User.findOne({ email: 'com@com.com' });
    if (user) {
      const isMatch = await bcrypt.compare('com', user.password);
      if (isMatch) {
        console.log("Auto-logging in with email:com@com.com and password:com");
        await user.save();
      } else {
        console.log("Auto-login failed");
      }
    } else {
      console.log("No user found with email:com@com.com");
    }
  } catch (error) {
    console.error(error);
    console.log("Error auto-logging in");
  }
};
