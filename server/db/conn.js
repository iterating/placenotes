import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()

const connectionString = process.env.ATLAS_URI
const dbName = process.env.DBNAME || 'placenotes'

if (!connectionString) {
  console.error('ATLAS_URI environment variable is not set')
  process.exit(1)
}

const options = {
  dbName,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
}

mongoose
  .connect(connectionString, options)
  .then(() => {
    console.log("MongoDB connected to database:", dbName)
    // Ensure the users collection exists
    const db = mongoose.connection.db
    return db.listCollections({ name: 'users' }).next().then(collInfo => {
      if (!collInfo) {
        console.log('Creating users collection...')
        return db.createCollection('users')
      }
    })
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error)
    // Don't exit in production, just log the error
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1)
    }
  })

mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB")
})

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected from MongoDB")
})

mongoose.connection.on("error", (error) => {
  console.error("Mongoose connection error:", error)
})

// Handle application termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close()
    console.log('MongoDB connection closed through app termination')
    process.exit(0)
  } catch (err) {
    console.error('Error closing MongoDB connection:', err)
    process.exit(1)
  }
})

export default mongoose
