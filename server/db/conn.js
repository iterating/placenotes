import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()

const connectionString = process.env.ATLAS_URI
const dbName = process.env.DBNAME || 'placenotes'

if (!connectionString) {
  console.error('ATLAS_URI environment variable is not set')
  process.exit(1)
}

// Add required parameters to connection string if they're missing
const addConnectionParams = (uri) => {
  const params = new URLSearchParams();
  if (!uri.includes('retryWrites=')) params.append('retryWrites', 'true');
  if (!uri.includes('w=')) params.append('w', 'majority');
  if (!uri.includes('replicaSet=')) params.append('replicaSet', 'atlas-11bmvx-shard-0');
  if (!uri.includes('authSource=')) params.append('authSource', 'admin');
  
  const paramString = params.toString();
  if (!paramString) return uri;
  
  return uri + (uri.includes('?') ? '&' : '?') + paramString;
};

const enhancedConnectionString = addConnectionParams(connectionString);
console.log('Connecting to MongoDB with enhanced connection string...');

const options = {
  dbName,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  heartbeatFrequencyMS: 2000,
  maxPoolSize: 10,
  minPoolSize: 5,
  autoIndex: true,
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true
  }
};

const connectWithRetry = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`MongoDB connection attempt ${i + 1} of ${retries}...`);
      await mongoose.connect(enhancedConnectionString, options);
      
      console.log("MongoDB connected successfully to database:", dbName);
      
      // Ensure the users collection exists
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      if (!collections.some(coll => coll.name === 'users')) {
        console.log('Creating users collection...');
        await db.createCollection('users');
      }
      
      return true;
    } catch (error) {
      console.error(`MongoDB connection attempt ${i + 1} failed:`, error.message);
      if (error.message.includes('ENOTFOUND')) {
        console.error('DNS lookup failed. Check your connection string and network.');
      } else if (error.message.includes('Authentication failed')) {
        console.error('Authentication failed. Check your username and password.');
      }
      
      if (i < retries - 1) {
        console.log(`Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw new Error(`Failed to connect to MongoDB after ${retries} attempts`);
};

// Initial connection
connectWithRetry()
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  });

// Connection event handlers
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB");
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected from MongoDB");
  if (process.env.NODE_ENV === 'production') {
    console.log("Attempting to reconnect...");
    connectWithRetry();
  }
});

mongoose.connection.on("error", (error) => {
  console.error("Mongoose connection error:", error);
  if (process.env.NODE_ENV === 'production') {
    console.log("Attempting to reconnect after error...");
    connectWithRetry();
  }
});

// Handle application termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
});

export default mongoose;
