import mongoose from "mongoose"
import dotenv from "dotenv"
import { createNoteIndexes } from '../models/Note.js'
dotenv.config()

const connectionString = process.env.ATLAS_URI
const dbName = process.env.DBNAME || 'placenotes'

if (!connectionString) {
  console.error('ATLAS_URI environment variable is not set')
  process.exit(1)
}

// MongoDB connection options
const options = {
  dbName,
  serverSelectionTimeoutMS: 60000, // Increase to 60 seconds
  socketTimeoutMS: 60000,
  connectTimeoutMS: 60000,
  family: 4  // Force IPv4
};

// Track connection state
let isConnected = false;

mongoose.connection.on('connected', async () => {
  console.log('MongoDB connected successfully');
  try {
    await mongoose.connection.db.collection('notes').dropIndexes();
    await createNoteIndexes();
    console.log('All indexes created successfully');
    isConnected = true;
  } catch (error) {
    console.error('Failed to create indexes:', error);
    // Don't set isConnected to true if index creation fails
  }
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  isConnected = false;
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

// Export connection state checker
export const isConnectedToDb = () => isConnected;

// Export connection function
export const connectWithRetry = async (retries = 5, initialDelay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`MongoDB connection attempt ${i + 1} of ${retries}...`);
      
      // Print connection string for debugging (hide credentials)
      const sanitizedUri = connectionString.replace(
        /(mongodb\+srv:\/\/)([^@]+)(@.+)/,
        '$1[hidden]$3'
      );
      console.log('Connecting to:', sanitizedUri);
      
      await mongoose.connect(connectionString, options);
      
      // Wait for connected event to handle index creation
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout waiting for indexes'));
        }, 30000);

        const checkConnection = setInterval(() => {
          if (isConnected) {
            clearInterval(checkConnection);
            clearTimeout(timeout);
            resolve();
          }
        }, 100);
      });

      return mongoose.connection;
    } catch (error) {
      console.error(`Connection attempt ${i + 1} failed:`, error.message);
      if (error.name === 'MongoServerSelectionError') {
        console.error('Server selection failed. Please check:');
        console.error('1. Your network connection');
        console.error('2. MongoDB Atlas whitelist settings');
        console.error('3. Database user credentials');
      }
      
      isConnected = false;
      if (i < retries - 1) {
        const delay = initialDelay * Math.pow(2, i); // Exponential backoff
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw new Error('Failed to connect to MongoDB after multiple attempts');
};

export default mongoose.connection;
