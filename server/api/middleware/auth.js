import jwt from "jsonwebtoken";
import {  generateToken } from "../../controllers/auth.controllers.js";

const getTokenFromHeader = (req) => {
  console.log("Extracting token from header...");
  if (req.headers.authorization) {
    const authHeader = req.headers.authorization;
    const token = authHeader.replace("Bearer ", "");
    console.log("Token found:", token);
    return token;
  }
  console.log("No token found in header");
  return { error: "No token found" };
};

export const setUser = (req, res, next) => {
  const token = getTokenFromHeader(req);
  if (token.error) {
    return res.status(401).json({ error: token.error });
  }
  jwt.verify(
    token,
    process.env.JWT_SECRET || "your_secret_key_here",
    (err, decoded) => {
      if (err) {
        console.error("Error verifying token:", err);
        return res.status(401).json({ error: "Invalid token" });
      }
      req.user = decoded;
      next();
    }
  );
};

console.log("JWT middleware initialized with secret:", process.env.JWT_SECRET || "secret");

export default setUser;