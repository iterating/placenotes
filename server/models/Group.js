import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    notes: [String]
});

export default mongoose.model("Group", groupSchema)