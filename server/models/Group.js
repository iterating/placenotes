import mongoose from "mongoose"

const groupSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100,
  },
  notes: [String],
})

export default mongoose.model("Group", groupSchema)
