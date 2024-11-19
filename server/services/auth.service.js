import User from "../models/User.js"
import { _id } from "../db/db.js"

//Using passport instead 
export const signup = async ({ email, password }) => {
    try {
      const newUser = new User({
        email,
        password,
        _id: _id(),
      })
      let errors = []
      if (password.length < 2) {
        errors.push({ text: "Passwords must be at least 2 characters." })
      }
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        errors.push({ text: "Email is already taken." })
      }
      if (errors.length > 0) {
        return { errorMessage: errors }
      }

      newUser.password = await newUser.encryptPassword(password)
      await newUser.save()
    } catch (error) {
      console.error(error)
      throw new Error("Error registering user")
    }
  }

  // Log In
  export const login = async ({ email, password }) => {
    console.log(`service Login attempt from ${email}`)

    const user = await User.findOne({ email })
    if (!user) {
      throw new Error("service: Incorrect email.")
    }
    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      throw new Error("Incorrect password.")
    }
    return user
  }

  // Log Out
  export const logout= async () => {
    return { successMessage: "You have been logged out" }
  }


  