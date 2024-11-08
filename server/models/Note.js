import mongoose from 'mongoose';
import bcrypt from "bcrypt";

const pointSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      }
})

const noteSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: String,
    email:  {
        type: String,
        required: true,
      },
      location: {
        type: {
          type: String, 
          enum: ['Point'],
        },
        coordinates: {
          type: [Number||1,1 ],
        }
      },
    radius: Number,
    time: Date,
    body: {
        type: String,
    },
    recipients: {
        type: Array
    }
})


export default mongoose.model("Note", noteSchema);


