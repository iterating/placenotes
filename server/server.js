import express from "express"
import ejs from "ejs"
import path from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"
import middleware from "./api/middleware/middleware.js"
import users from "./api/routes/userRoutes.js"
import notes from "./api/routes/noteRoutes.js"
import db from "./db/conn.js"
import dotenv from "dotenv"
dotenv.config()

const app = express()

// Middleware
middleware(app)
const __dirname = dirname(fileURLToPath(import.meta.url))

// Make css available
app.use("/assets", express.static(path.join(__dirname, "./views/assets")))

// View Engine
app.set("views", path.join(__dirname, "./views"))
app.engine(".ejs", ejs.renderFile)
app.set("view engine", "ejs")

// Routes
app.use("/api/users", users)
app.use("/api/notes", notes)
app.get("/api", (req, res) => {
  res.json({ message: 'Welcome to Placenotes API' })
})

// Only start the server if we're not in a serverless environment
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`)
  })
}

export default app;
