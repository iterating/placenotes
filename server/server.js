import dotenv from "dotenv"
import express from "express"
import { fileURLToPath } from "url"
import { dirname } from "path"
import users from "./api/routes/users.routes.js"
import notes from "./api/routes/notes.routes.js"
import messages from "./api/routes/messages.routes.js"
import friends from "./api/routes/friends.routes.js"
import auth from "./api/routes/auth.routes.js"
import { connectWithRetry, isConnectedToDb } from "./db/conn.js"
import cors from 'cors'
import { ApolloServer } from '@apollo/server' 
import { expressMiddleware } from '@as-integrations/express5'
import { typeDefs } from './graphql/schema.js'
import { resolvers } from './graphql/resolvers.js'

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
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Initialize database connection
let dbInitialized = false;
let apolloServer = null;

const initializeServer = async () => {
  if (!dbInitialized) {
    await connectWithRetry();
    dbInitialized = true;
  }
  
  if (!apolloServer) {
    apolloServer = new ApolloServer({
      typeDefs,
      resolvers,
    });
    await apolloServer.start();
    
    app.use(
      '/graphql',
      cors(corsOptions),
      expressMiddleware(apolloServer, {
        context: async ({ req }) => ({ req })
      })
    );
  }
};

// Mount API routes
app.use('/api/users', users)
app.use('/api/notes', notes)
app.use('/api/messages', messages)
app.use('/api/friends', friends)
app.use('/api/auth', auth)

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "healthy",
    environment: process.env.NODE_ENV,
    mongodb: isConnectedToDb() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.get("/api", (req, res) => {
  res.json({ 
    message: 'Welcome to Placenotes API',
    version: '1.0.0'
  });
});

app.use('/api', (req, res, next) => {
  // Only handle unmatched API routes
  if (req.originalUrl.startsWith('/api/')) {
    res.status(404).json({ 
      message: 'API endpoint not found',
      requestedUrl: req.url
    });
  } else {
    next();
  }
});

// Vercel serverless function handler
export default async function handler(req, res) {
  await initializeServer();
  return app(req, res);
}
