import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()

const connectionString = process.env.ATLAS_URI
const dbName = process.env.DBNAME || 'placenotes'

if (!connectionString) {
  console.error('ATLAS_URI environment variable is not set')
  process.exit(1)
}

// Parse connection string to get cluster info
const getClusterInfo = (uri) => {
  try {
    const match = uri.match(/mongodb\+srv:\/\/(.*?):(.*?)@(.*?)\//);
    return match ? match[3] : null;
  } catch (err) {
    console.error('Error parsing MongoDB URI:', err);
    return null;
  }
};

const clusterName = getClusterInfo(connectionString);
console.log('Connecting to MongoDB cluster:', clusterName);

const options = {
  dbName,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  heartbeatFrequencyMS: 2000,
  maxPoolSize: 10,
  minPoolSize: 5
};

const connectWithRetry = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`MongoDB connection attempt ${i + 1} of ${retries}...`);
      await mongoose.connect(connectionString, options);
      
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
