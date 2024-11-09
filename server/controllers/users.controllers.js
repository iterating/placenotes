import User from "../models/User.js"
import Note from "../models/Note.js"

export const allUsers = async (req, res) => {
  try {
    const users = await User.find()
    res.json(users)
  } catch (err) {
    console.error(err)
    res.status(500).send("Error getting users")
  }
}

export const accountSet = async (req, res) => {
  const { name, email } = req.body
  try {
    await User.findByIdAndUpdate(req.user._id, { name, email })
    res.redirect("/notes")
  } catch (err) {
    console.error(err)
    res.status(400).send("Error updating user")
  }
}
