import * as AuthService from "../services/auth.service.js"
import * as NotesService from "../services/notes.service.js"
import passport from "../api/middleware/passport.js"
import jwt from "jsonwebtoken"

console.log("Auth Controller loaded")

export const generateToken = (user) => {
  console.log("Generating token for", user)
  if (!user) {
    throw new Error("User cannot be null")
  }
  const payload = {
    _id: user._id,
    email: user.email,
  }
  if (!payload._id || !payload.email) {
    throw new Error("User payload cannot be null")
  }
  const secret = process.env.JWT_SECRET || "defaultSecretKey"
  const options = { expiresIn: "6h" }
  const token = jwt.sign(payload, secret, options)
  console.log("Token generated:", token)
  return token
}

export const signup = async (req, res) => {
  console.log("Signup request received:", req.body)
  try {
    const { email, password, ...userData } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      })
    }

    const result = await AuthService.signup({ email, password, ...userData })
    
    if (result.errorMessage) {
      return res.status(400).json({
        success: false,
        errors: result.errorMessage
      })
    }

    // Log the user in after successful signup
    req.login(result, (err) => {
      if (err) {
        console.error("Error logging in after signup:", err)
        return res.status(500).json({
          success: false,
          message: "Error logging in after signup"
        })
      }

      const token = generateToken(result)
      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
          _id: result._id,
          email: result.email
        },
        token
      })
    })
  } catch (error) {
    console.error("Error in signup controller:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Error registering user"
    })
  }
}

export const login = async (req, res, next) => {
  console.log("Login request received:", req.body)
  passport.authenticate("localLogin", async (err, user, info) => {
    if (err) {
      console.error("Error in passport authentication:", err)
      return res.status(500).json({
        success: false,
        message: "Authentication error"
      })
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: info?.message || "Authentication failed"
      })
    }

    try {
      // Fetch user's notes
      const notes = await NotesService.getNotes(user._id.toString())
      console.log(`Retrieved ${notes.length} notes for user ${user._id}`)

      req.login(user, (err) => {
        if (err) {
          console.error("Error logging in:", err)
          return res.status(500).json({
            success: false,
            message: "Error establishing session"
          })
        }

        const token = generateToken(user)
        return res.json({
          success: true,
          message: "Login successful",
          user: {
            _id: user._id,
            email: user.email
          },
          token,
          notes
        })
      })
    } catch (error) {
      console.error("Error fetching user notes:", error)
      return res.status(500).json({
        success: false,
        message: "Error fetching user notes"
      })
    }
  })(req, res, next)
}

export const logout = (req, res) => {
  console.log("Logout request received")
  try {
    req.logout((err) => {
      if (err) {
        console.error("Error during logout:", err)
        return res.status(500).json({
          success: false,
          message: "Error during logout"
        })
      }
      
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err)
          return res.status(500).json({
            success: false,
            message: "Error clearing session"
          })
        }
        
        res.clearCookie("connect.sid")
        return res.json({
          success: true,
          message: "Logged out successfully"
        })
      })
    })
  } catch (error) {
    console.error("Unexpected error during logout:", error)
    res.status(500).json({
      success: false,
      message: "Error during logout"
    })
  }
}

export default {
  signup,
  login,
  logout
};
