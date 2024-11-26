import mongoose from "mongoose"
import bcrypt from "bcrypt"

const pointSchema = new mongoose.Schema({
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number, Number],
      default: [-118.243683, 34.052235],
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
      type: [Number], // This will ensure that it's an array of numbers
      required: true,
      validate: {
        validator: function (value) {
          return value.length === 2 && !isNaN(value[0]) && !isNaN(value[1]);
        },
        message: 'Coordinates must be a valid [longitude, latitude] pair',
      },
    },
  },
  radius: {
    type: Number,
    min: 1,
    max: 100000,
    default: 200,
  },
  time: {
    type: Date,
    default: Date.now,
  },
  body: {
    type: String,
    required: true,
    maxlength: 1500000,
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
  type: {
    type: String,
    enum: ["note", "reminder", "event"],
    default: "note",
  },
  status: {
    type: String,
    enum: ["active", "unseen", "seen", "archived"],
    default: "active",
  },
})

noteSchema.index({ location: "2dsphere" })

export default mongoose.model("Note", noteSchema)
