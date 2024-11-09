import * as authService from "../services/auth.service.js"
import passport from "../api/middleware/passport.js"

export const signup = async (req, res) => {
  try {
    const { email, password } = req.body
    let errors = []
    if (password.length < 2) {
      errors.push({ text: "Passwords must be at least 2 characters." })
    }
    if (errors.length > 0) {
      req.flash("errorMessage", errors)
      return res.redirect("/users/signup")
    }

    await authService.signup({ email, password })
    req.flash("successMessage", "User registered")
    req.logIn(await authService.login({ email, password }), (err) => {
      if (err) return next(err)
      res.redirect("/notes")
    })
  } catch (error) {
    console.error(error)
    res.status(500).send("Error registering user")
  }
}

// Log In
export const login = async (req, res, next) => {
  console.log(`controller Login attempt from ${req.body.email}`)
  passport.authenticate("localLogin", (err, user, info) => {
    if (err) {
      console.error("Error during authentication", err)
      return next(err)
    }
    if (!user) {
      req.flash("errorMessage", info.message)
      return res.redirect("/users/login")
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error("Error logging in user", err)
        return next(err)
      }
      res.redirect("/notes")
    })
  })(req, res, next)
}

export const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err)
    req.flash("successMessage", "You have been logged out")
    res.redirect("/users/login")
  })
}
