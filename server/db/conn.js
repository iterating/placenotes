import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const connectionString = process.env.ATLAS_URI;
const dbName = process.env.DBNAME;

mongoose
  .connect(connectionString, { dbName })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error(error);
  });

mongoose.connection.on("connected", () => {
  console.log("Mongoose is connected");
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose is disconnected");
});

mongoose.connection.on("error", (error) => {
  console.log(error);
});

export default mongoose;
