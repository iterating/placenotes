import * as AuthService from "../services/auth.service.js"
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

// export const refreshToken = async (token) => {
//   console.log("Refreshing token", token)
//   if (!token) {
//     throw new Error("Token cannot be null")
//   }
//   try {
//     const decoded = jwt.decode(token)
//     if (!decoded) {
//       throw new Error("Token is invalid")
//     }
//     const { _id, email } = decoded
//     if (!_id || !email) {
//       throw new Error("Decoded token is invalid")
//     }
//     const newToken = generateToken({ _id, email })
//     console.log("Refreshed token:", newToken)
//     return newToken
//   } catch (err) {
//     console.error("Error refreshing token", err)
//     return null
//   }
// }

export const signup = async (req, res) => {
  console.log(
    "Signup request received. Email:",
    req.body.email,
    "Location:",
    req.body.location
  )
  try {
    const currentLocation = JSON.parse(req.body.location)
    const user = await AuthService.signup({
      email: req.body.email,
      password: req.body.password,
      name: "",
      currentLocation: {
        type: "Point",
        coordinates: currentLocation.coordinates || [-118.243683, 34.052235],
      },
      createdAt: Date.now(),
      lastActive: Date.now(),
      friends: {
        added: [],
        accepted: [],
      },
      group: [],
    })
    console.log("User created:", user);
    req.logIn(user, (err) => {
      if (err) {
        console.error("Error during req.logIn", err);
        return res.status(500).send("Error during req.logIn");
      }
      const token = generateToken({ _id: user._id, email: user.email });
      req.session.user = user;
      req.session.token = token;
      console.log("User logged in. Token:", token);
      return res.json({ user, token });
    });
  } catch (err) {
    console.error("Error during signup", err);
    res.status(500).send("Error during signup");
  }
}

export const login = async (req, res, next) => {
  console.log("Login request received. Email:", req.body.email)
  passport.authenticate("localLogin", (err, user, info) => {
    if (err) {
      console.error("Error during authentication", err)
      return next(err)
    }
    if (!user) {
      console.log("User not found")
      return res.status(404).send("User not found")
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error("Error during req.logIn", err)
        return next(err)
      }
      const token = generateToken({ _id: user._id, email: user.email })
      req.session.user = user
      req.session.token = token
      console.log("User logged in. Token:", token)
      return res.json({ user, token })
    })
  })(req, res, next)
}

export const logout = (req, res) => {
  console.log("Logout request received")
  if (!req.session) {
    console.error("Session was not found")
    return res.redirect("/users/login")
  }
  req.logout()
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session", err)
    }
    res.redirect("/users/login")
  })
}
