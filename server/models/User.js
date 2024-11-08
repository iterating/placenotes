import mongoose from "mongoose";
import bcrypt from "bcrypt";

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
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address']
  },
  name: String,
  group: String,
  password: {
    type: String,
    required: true
  },
  currentLocation: {
    type: {
      type: String, 
      enum: ['Point'],
    },
    coordinates: {
      type: [Number, Number||1,1 ],
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date
  },
});

// index email
userSchema.index({ email: 1 }, { unique: true });

userSchema.index({ currentLocation: "2dsphere" });

userSchema.methods.encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(1);
  return await bcrypt.hash(password, salt);
};
userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};


export default mongoose.model("User", userSchema);

