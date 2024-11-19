import passport from "passport"
import { Strategy as LocalStrategy } from "passport-local"
import * as usersService from "../../services/users.service.js"

passport.use(
  "localLogin",
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        console.log(`Passport login with email: ${email}`)
        const user = await usersService.findByEmail(email)
        if (!user) {
          console.log("Passport: Incorrect email.")
          return done(null, false, { message: "Incorrect email." })
        }
        console.log("User found. Checking password...")
        if (!(await user.matchPassword(password))) {
          console.log("Incorrect password.")
          return done(null, false, { message: "Incorrect password." })
        }
        console.log("Login successful.")
        return done(null, user)
      } catch (err) {
        console.error("Error during authentication", err)
        return done(err)
      }
    }
  )
)


passport.serializeUser((user, done) => {
  if (user && user._id) {
    done(null, user._id.toString());
  } else {
    done(new Error("User object is invalid or missing _id property"));
  }
});
passport.deserializeUser((id, done) => {
  AuthService.getUserById(id, (err, user) => {
    done(err, user);
  });
});

export default passport
