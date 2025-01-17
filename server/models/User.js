import bcrypt from "bcrypt";
import dbAdapter from '../db/connection.js';
import BaseModel from './BaseModel.js';

const client = dbAdapter.getClient();
const { Schema } = client;

const userSchema = new Schema({
  _id: Schema.Types.ObjectId,
  email: {
    type: String,
    unique: true,
    required: true,
    dropDups: true,
    trim: true,
    lowercase: true,
    maxlength: 50,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
  },
  name: {
    type: String,
    default: "",
  },
  group: [],
  password: {
    type: String,
    required: true,
  },
  currentLocation: {
    type: {
      type: String,
      enum: ["Point"],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v) {
          return v.length === 2 && 
                 v[0] >= -180 && v[0] <= 180 && 
                 v[1] >= -90 && v[1] <= 90;
        },
        message: "Coordinates must be [longitude, latitude] format"
      }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
  friendRequests: [{
    from: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending"
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
});

// Create a 2dsphere index on the currentLocation field
userSchema.index({ currentLocation: "2dsphere" });

// Add schema methods
userSchema.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

class UserModel extends BaseModel {
  constructor() {
    super('User', userSchema);
  }

  // User-specific methods
  async encryptPassword(password) {
    const salt = await bcrypt.genSalt(1);
    return await bcrypt.hash(password, salt);
  }

  async findByEmail(email) {
    return await this.findOne({ email: email.toLowerCase() });
  }

  async findNearbyUsers(coordinates, maxDistance, query = {}) {
    return await this.model.find({
      ...query,
      currentLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates
          },
          $maxDistance: maxDistance
        }
      }
    });
  }

  async updateLastActive(userId) {
    return await this.updateOne(
      { _id: userId },
      { $set: { lastActive: new Date() } }
    );
  }
}

const userModel = new UserModel();
export default userModel;
