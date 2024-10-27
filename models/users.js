import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  username: String,
  password: String,
  email: {
    type: String,
    unique: true,
    required: true,
    dropDups: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
});

export default mongoose.model("user", userSchema)
