import mongoose from "mongoose"

export const _id = () => {
  return new mongoose.Types.ObjectId()
}

//db layer
export const findOne = async ({ email }) => {
  return User.findOne({ email })
}

export const create = async (user) => {
  return User.create(user)
}
