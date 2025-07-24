// Required for passport
import passport from "./passport.js"
import express from "express"
import session from "express-session"
import cors from "cors"


const middleware = (app) => {
  app.use(cors({ origin: "*" }))
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "secret",
      resave: false,
      saveUninitialized: false,
    })
  )
  app.use(passport.initialize())
  app.use(passport.session())
  // app.use(flash())


  app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).send({ message: "An error occurred", error: err.message })
  })
}

export default middleware

