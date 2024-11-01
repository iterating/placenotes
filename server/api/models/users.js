import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: {
    type: String,
    unique: true,
    required: true,
    dropDups: true,
    // match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  name: String,
  group: String,
  password: {
    type: String,
    required: true
  }
});

// index email
userSchema.index({ email: 1 }, { unique: true });

userSchema.methods.encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(1);
  return await bcrypt.hash(password, salt);
};
userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};


export default mongoose.model("User", userSchema);

