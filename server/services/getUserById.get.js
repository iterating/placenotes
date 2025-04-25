// d:\studio\atelier\placenotes\server\services\getUserById.get.js

import mongoose from "mongoose";
import User from "../models/User.js";

/**
 * Retrieves a user by their MongoDB ObjectId.
 * @param {string} id - The ObjectId of the user.
 * @returns {Promise<User>} The found user document.
 * @throws {Error} If the ID is invalid or the user is not found.
 */
export const getUserById = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid user ID format');
    }

    const user = await User.findById(id).exec();
    if (!user) {
      // It might be better to return null or undefined instead of throwing an error
      // Depending on how this function is used upstream.
      // Throwing for now to match original behavior.
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    // Log the specific error for debugging
    console.error(`Error in getUserById for ID ${id}:`, error);
    // Re-throw the error to be handled by the caller
    throw error;
  }
};
