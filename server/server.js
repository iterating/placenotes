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
const allowedOrigins = [
  'http://localhost:5173',  // Vite dev server
  'http://localhost:4173',  // Vite preview
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  'https://placenotes.vercel.app'
].filter(Boolean)

const corsOptions = {
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.log('Origin not allowed:', origin)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

// Middleware
middleware(app)

// API Routes
app.use("/api/users", users)
app.use("/api/notes", notes)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "healthy",
    environment: process.env.NODE_ENV,
    vercelUrl: process.env.VERCEL_URL || 'not set'
  })
})

// Root API route
app.get("/api", (req, res) => {
  res.json({ 
    message: 'Welcome to Placenotes API',
    version: '1.0.0',
    environment: process.env.NODE_ENV
  })
})

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '../../client/dist')
  
  // Serve static files
  app.use(express.static(clientDistPath))
  
  // Serve index.html for client routes
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) {
      return next()
    }
    res.sendFile(path.join(clientDistPath, 'index.html'))
  })
} else {
  // Development static files
  app.use("/assets", express.static(path.join(__dirname, "./views/assets")))
  app.set("views", path.join(__dirname, "./views"))
  app.engine(".ejs", ejs.renderFile)
  app.set("view engine", "ejs")
}

// Error handling
app.use((err, req, res, next) => {
  console.error('Error occurred:', err)
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  })
})

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  console.log('API 404 Not Found:', req.method, req.url)
  res.status(404).json({ 
    message: 'API endpoint not found',
    requestedUrl: req.url
  })
})

// Start server
const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`)
  console.log('Node environment:', process.env.NODE_ENV)
  console.log('Vercel URL:', process.env.VERCEL_URL || 'not set')
})

export default app
