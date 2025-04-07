import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"
import middleware from "./api/middleware/middleware.js"
import users from "./api/routes/userRoutes.js"
import notes from "./api/routes/noteRoutes.js"
import messages from "./routes/messages.routes.js"
import friends from "./routes/friends.routes.js"
import auth from "./api/routes/authRoutes.js"
import { connectWithRetry, isConnectedToDb } from "./db/conn.js"
import dotenv from "dotenv"
import cors from 'cors'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { typeDefs } from './graphql/schema.js'
import { resolvers } from './graphql/resolvers.js'
import session from 'express-session'
import passport from 'passport'
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

// Apply middleware
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))

// Initialize Passport
app.use(passport.initialize())
app.use(passport.session())

// Mount API routes
app.use('/api/users', users)
app.use('/api/notes', notes)
app.use('/api/messages', messages)
app.use('/api/friends', friends)
app.use('/api/auth', auth)

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')))
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'))
  })
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "healthy",
    environment: process.env.NODE_ENV,
    mongodb: isConnectedToDb() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Root API route
app.get("/api", (req, res) => {
  res.json({ 
    message: 'Welcome to Placenotes API',
    version: '1.0.0'
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    message: 'API endpoint not found',
    requestedUrl: req.url
  });
});

// Start Apollo Server and Express
const startServer = async () => {
  try {
    await connectWithRetry()
    
    // Create Apollo Server
    const apolloServer = new ApolloServer({
      typeDefs,
      resolvers,
    });
    
    await apolloServer.start();

    // Apply middleware after Apollo Server is started
    app.use(
      '/graphql',
      cors(corsOptions),
      expressMiddleware(apolloServer, {
        context: async ({ req }) => ({ req })
      })
    );

    const port = process.env.PORT || 5000
    app.listen(port, () => {
      console.log(`Server is running on port: ${port}`)
      console.log(`GraphQL endpoint: http://localhost:${port}/graphql`)
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

// Start the server
startServer();
