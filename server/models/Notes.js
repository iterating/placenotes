import mongoose from 'mongoose';
import { Marked } from 'marked';

const noteSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: String,
    email:  {
        type: String,
        required: true,
      },
    location: {
        lat: {type: String},
        lon: {type: String},   
    },
    radius: Number,
    time: String,
    body: {
        type: String,
    }
})


export default mongoose.model("Note", noteSchema);


