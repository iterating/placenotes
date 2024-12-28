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

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',                    // Local Vite development
  'http://localhost:4173',                    // Local Vite preview
  'https://placenotes.vercel.app',           // Production frontend on Vercel
  'https://placenotes-git-main.vercel.app',  // Vercel preview deployments
  process.env.FRONTEND_URL                    // Environment variable if set
].filter(Boolean) // Remove any undefined values

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log('Blocked by CORS:', origin)
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.'
      return callback(new Error(msg), false)
    }
    return callback(null, true)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Middleware
middleware(app)
const __dirname = dirname(fileURLToPath(import.meta.url))

// Make css available
app.use("/assets", express.static(path.join(__dirname, "./views/assets")))

// View Engine
app.set("views", path.join(__dirname, "./views"))
app.engine(".ejs", ejs.renderFile)
app.set("view engine", "ejs")

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: 'healthy' })
})

// Routes
app.use("/users", users)
app.use("/notes", notes)
app.get("/", (req, res) => {
  res.json({ message: 'Welcome to Placenotes API' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// Only start the server if we're not in a serverless environment
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`)
  })
}

export default app;
