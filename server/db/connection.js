import dotenv from 'dotenv';
import DatabaseFactory from './factory.js';

dotenv.config();

const connectionString = process.env.ATLAS_URI;
const dbName = process.env.DBNAME || 'placenotes';

if (!connectionString) {
  console.error('ATLAS_URI environment variable is not set');
  process.exit(1);
}

// Database configuration
const dbConfig = {
  connectionString,
  options: {
    dbName,
    serverSelectionTimeoutMS: 60000,
    socketTimeoutMS: 60000,
    connectTimeoutMS: 60000,
    family: 4
  }
};

// Create database adapter instance
// This can be changed to use different databases by changing the type
const dbAdapter = DatabaseFactory.createAdapter('mongodb', dbConfig);

// Export connection state checker
export const isConnectedToDb = () => dbAdapter.isConnectedToDb();

// Export connection function with retry mechanism
export const connectWithRetry = async (retries = 5, initialDelay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Database connection attempt ${i + 1} of ${retries}...`);
      
      // Print connection string for debugging (hide credentials)
      const sanitizedUri = connectionString.replace(
        /(mongodb\+srv:\/\/)([^@]+)(@.+)/,
        '$1[hidden]$3'
      );
      console.log('Connecting to:', sanitizedUri);
      
      await dbAdapter.connect();
      return dbAdapter.getClient();
    } catch (error) {
      console.error(`Connection attempt ${i + 1} failed:`, error.message);
      
      if (i < retries - 1) {
        const delay = initialDelay * Math.pow(2, i); // Exponential backoff
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  await dbAdapter.disconnect();
  console.log('Database connection closed through app termination');
  process.exit(0);
});

export default dbAdapter;
