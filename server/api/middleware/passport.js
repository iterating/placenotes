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
  done(null, user.id)
})
passport.deserializeUser(async (id, done) => {
  console.log(`Deserializing user: ${id}`)
  try {
    const user = await usersService.findById(id)
    done(null, user)
  } catch (err) {
    done(err)
  }
})

export default passport
