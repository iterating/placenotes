import mongoose from "mongoose"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: {
    type: String,
    unique: true,
    required: true,
    dropDups: true,
    trim: true,
    lowercase: true,
    maxlength: 50,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
  },
  name: {
    type: String,
    default: "",
  },
  group: [],
  password: {
    type: String,
    required: true,
  },
  currentLocation: {
    type: {
      type: String,
      enum: ["Point"],
    },
    coordinates: {
      type: [Number, Number],
      default: [-118.243683, 34.052235],
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  friendRequests: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending"
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
})

userSchema.index({ currentLocation: "2dsphere" })

userSchema.methods.encryptPassword = async function(password) {
  const salt = await bcrypt.genSalt(1)
  return await bcrypt.hash(password, salt)
}
userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password)
}

export default mongoose.model("User", userSchema)
