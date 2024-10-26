const mongoose = require("mongoose");

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

modules.exports = mongoose.model("user", userSchema)