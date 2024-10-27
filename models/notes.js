import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userID: {
        type: mongoose.Schema.Types.ObjectId,
    },
    location: {
        latitude: {type: String},
        longitude: {type: String},   
    },
    time: String,
    body: String
})

export default mongoose.model("note", noteSchema);

