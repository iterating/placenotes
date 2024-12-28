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
import cors from 'cors'
dotenv.config()

const app = express()
const __dirname = dirname(fileURLToPath(import.meta.url))

// CORS configuration
app.use(cors())

// Middleware
middleware(app)

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')))

// Make css available
app.use("/assets", express.static(path.join(__dirname, "./views/assets")))

// View Engine
app.set("views", path.join(__dirname, "./views"))
app.engine(".ejs", ejs.renderFile)
app.set("view engine", "ejs")

// API Routes
app.use("/api/users", users)
app.use("/api/notes", notes)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: 'healthy' })
})

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'))
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})

export default app
