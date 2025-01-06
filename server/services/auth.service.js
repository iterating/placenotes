import User from "../models/User.js";
import { _id } from "../db/db.js";
import mongoose from "mongoose";

export const signup = async ({ email, password, currentLocation, ...userData }) => {
  try {
    let errors = [];
    
    if (password.length < 2) {
      errors.push({ text: "Passwords must be at least 2 characters." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      errors.push({ text: "Email is already taken." });
    }

    if (errors.length > 0) {
      return { errorMessage: errors };
    }

    const newUser = new User({
      _id: new mongoose.Types.ObjectId(),
      email,
      password,
      currentLocation: {
        type: 'Point',
        coordinates: currentLocation?.coordinates || [-118.243683, 34.052235]
      },
      ...userData,
    });

    newUser.password = await newUser.encryptPassword(password);
    const savedUser = await newUser.save();
    return savedUser;
  } catch (error) {
    console.error('Error in signup:', error);
    throw error;
  }
};

export const login = async ({ email, password }) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }
    
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new Error('Invalid password');
    }
    
    return user;
  } catch (error) {
    console.error('Error in login:', error);
    throw error;
  }
};

export const logout = () => {
  return new Promise((resolve) => {
    resolve({ success: true });
  });
};

export const getUserById = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid user ID format');
    }
    
    const user = await User.findById(id).exec();
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  } catch (error) {
    console.error('Error in getUserById:', error);
    throw error;
  }
};

// Callback style for passport compatibility
export const getUserByIdCallback = (id, done) => {
  getUserById(id)
    .then(user => done(null, user))
    .catch(error => done(error));
};

export default {
  signup,
  login,
  logout,
  getUserById,
  getUserByIdCallback
};
