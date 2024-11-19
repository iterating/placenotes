import jwt from "jsonwebtoken";
import { refreshToken, generateToken } from "../../controllers/auth.controllers.js";
export const setUser = async (req, res, next) => {
  console.log("setUser called");
  const authHeader = req.header("Authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    console.log("No token provided. Please login.");
    return res.status(401).send("No token provided. Please login.");
  }

  try {
    console.log("Verifying token...");
    const { _id, email } = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    // Destroy the old token
    await refreshToken(token);

    // Generate a new token and replace the old one
    const newToken = generateToken({ _id, email });
    res.setHeader("Authorization", `Bearer ${newToken}`);

    req.user = { _id, email };
    res.locals.user = req.user;

    next();
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(401).send("Invalid token.");
  }
};

