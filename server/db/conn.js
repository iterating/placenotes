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

const options = {
  dbName,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// Track connection state
let isConnected = false;

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
  isConnected = true;
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
export const connectWithRetry = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`MongoDB connection attempt ${i + 1} of ${retries}...`);
      await mongoose.connect(enhancedConnectionString, options);
      console.log('MongoDB connected successfully');
      isConnected = true;
      return mongoose.connection;
    } catch (error) {
      console.error(`Connection attempt ${i + 1} failed:`, error.message);
      isConnected = false;
      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw new Error('Failed to connect to MongoDB after multiple attempts');
};

export default mongoose.connection;
