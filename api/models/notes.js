import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
    location: {
        lat: {type: String},
        lon: {type: String},   
    },
    time: String,
    body: String
})

export default mongoose.model("note", noteSchema);

