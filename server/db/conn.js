import mongoose from "mongoose";
import { MongoClient } from "mongodb"
import dotenv from 'dotenv'
dotenv.config()
const connectionString = process.env.ATLAS_URI

mongoose.connect(connectionString)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch(error => {
    console.error(error);
  });

mongoose.connection.on("connected", () => {
    console.log("Mongoose is connected");
  });

mongoose.connection.on("disconnected", () => {
    console.log("Mongoose is disconnected");
  });

export default mongoose
