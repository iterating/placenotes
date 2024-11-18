import User from "../models/User.js"

export const userByName = async (name) => {
  try {
    return await User.find({ name })
  } catch (err) {
    throw new Error("Error finding user")
  }
}

export const findUsers = async (query) => {
  try {
    return await User.find(query).lean()
  } catch (err) {
    throw new Error("Error finding users")
  }
}

export const findOneUser = async (query) => {
  try {
    return await User.findOne(query).lean()
  } catch (err) {
    throw new Error("Error finding user")
  }
}

export const findByEmail = (email) => {
  return User.find({ email })
}

export const findByGroup = (group) => {
  return User.find({ group })
}
export const findUserNotesByIdAndTime = async (userId, time) => {  const user = await User.findById(userId)
  if (!user) {
    throw new Error("User not found")
  }
  const notes = await Note.find({ userId: user._id, createdAt: { $gte: time } })
  return notes
}
export default {}
