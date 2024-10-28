import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import User from "../models/users.js";

passport.use(
  new LocalStrategy(
    { usernameField: "email",
      passwordField: "password"
    },
    async (email, password, done) => {
      try {
        console.log(`Attempting login with email: ${email}`);
        const user = await User.findOne({ email });
        if (!user) {
          console.log("Incorrect email.");
          return done(null, false, { message: "Incorrect email." });
        }
        console.log("User found. Checking password...");
        if (!await user.matchPassword(password)) {
          console.log("Incorrect password.");
          return done(null, false, { message: "Incorrect password." });
        }
        console.log("Login successful.");
        return done(null, user);
      } catch (err) {
        console.error("Error during authentication", err);
        return done(err);
      }
    }
  )
);

export default passport;
