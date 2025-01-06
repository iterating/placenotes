import jwt from "jsonwebtoken";
import {  generateToken } from "../../controllers/auth.controllers.js";

const getTokenFromHeader = (req) => {
  if (req.headers.authorization) {
    const authHeader = req.headers.authorization;
    const token = authHeader.replace("Bearer ", "");
    return token;
  }
  console.log("Warning: No token found in authorization header");
  return { error: "No token found" };
};

export const setUser = (req, res, next) => {
  const token = getTokenFromHeader(req);
  if (token.error) {
    return res.status(401).json({ error: token.error });
  }
  jwt.verify(
    token,
    process.env.JWT_SECRET || "secret",
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

// Only log on initialization
if (process.env.NODE_ENV !== 'production') {
  console.log("JWT middleware initialized with secret:", process.env.JWT_SECRET ? '[SECRET]' : 'default');
}

export default setUser;