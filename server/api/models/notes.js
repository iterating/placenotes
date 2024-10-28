import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
    email:  {
        type: String,
        required: true,
      },
    location: {
        lat: {type: String},
        lon: {type: String},   
    },
    time: String,
    body: String
})

export default mongoose.model("Note", noteSchema);

