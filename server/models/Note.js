import mongoose from "mongoose"
import bcrypt from "bcrypt"

const pointSchema = new mongoose.Schema({
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
    }
  },
})

const noteSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userId: String,
  email: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
    }
  },
  radius: {
    type: Number,
    min: 0,
    max: 100000,
  },
  time: {
    type: Date,
    default: Date.now,
  },
  body: {
    type: String,
    required: true,
    maxlength: 8000,
  },
  recipients: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      readAt: Date,
    },
  ],
})

noteSchema.index({ location: "2dsphere" })

export default mongoose.model("Note", noteSchema)
