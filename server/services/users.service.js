import User from "../models/User.js";

export const userByName = async (name) => {
  if (!name) {
    throw new Error("Name is required")
  }
  try {
    return await User.find({ name })
  } catch (err) {
    throw new Error("Error finding user")
  }
}

export const findById = async (id) => {
  if (!id) {
    throw new Error("ID is required")
  }
  try {
    return await User.findById(id)
  } catch (err) {
    throw new Error("Error finding user")
  }
}
export const findByEmail = (email) => {
  if (!email) {
    throw new Error("Email is required")
  }
  return User.findOne( { email })
}

export const findUsers = async (query) => {
  if (!query) {
    throw new Error("Query is required")
  }
  try {
    return await User.find(query)
  } catch (err) {
    throw new Error("Error finding users")
  }
}

export const findOneUser = async (query) => {
  if (!query) {
    throw new Error("Query is required")
  }
  try {
    return await User.findOne(query).lean()
  } catch (err) {
    throw new Error("Error finding user")
  }
}



export const findByGroup = (group) => {
  if (!group) {
    throw new Error("Group is required")
  }
  return User.find({ group })
}

export const findUserNotesByIdAndTime = async (userId, time) => {
  if (!userId) {
    throw new Error("User ID is required")
  }
  if (!time) {
    throw new Error("Time is required")
  }
  const user = await User.findById(userId)
  if (!user) {
    throw new Error("User not found")
  }
  const notes = await Note.find({ userId: user._id, createdAt: { $gte: time } })
  return notes
}


