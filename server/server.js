import express from "express"
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
  'http://localhost:5173',
  'http://localhost:4173',
  'https://placenotes.vercel.app',
  'https://placenotes-git-vercel-iterating.vercel.app',
  /^https:\/\/placenotes.*\.vercel\.app$/
]

const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if the origin matches any allowed origins
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return allowedOrigin === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('Origin not allowed:', origin);
      callback(new Error('Not allowed by CORS'));
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
    timestamp: new Date().toISOString()
  })
})

// Root API route
app.get("/api", (req, res) => {
  res.json({ 
    message: 'Welcome to Placenotes API',
    version: '1.0.0'
  })
})

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

// Start the server if we're not in Vercel
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 5000
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
    console.log('Node environment:', process.env.NODE_ENV)
  })
}

export default app
