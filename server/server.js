import express from "express"
import ejs from "ejs"
import path from "path"
import { fileURLToPath } from "url"
import middleware from "./api/middleware/middleware.js"
import users from "./api/routes/userRoutes.js"
import notes from "./api/routes/noteRoutes.js"
import db from "./db/conn.js"
import dotenv from "dotenv"

dotenv.config()
const PORT = process.env.PORT || 5000

const app = express()

// Middleware
middleware(app)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Make css available
app.use("/assets", express.static(path.join(__dirname, "./views/assets")))
// Make components available

// View Engine
app.set("views", path.join(__dirname, "./views"))
app.engine(".ejs", ejs.renderFile)
app.set("view engine", "ejs")

//Routes
app.use("/users", users)
app.use("/notes", notes)
app.get("/", (req, res) => {
  res.send('Welcome to Placenotes. <a href="/users/login">Go to Login</a>')
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).send({ message: "An error occurred", error: err.message })
})

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})

// take export default app into ./loaders
