import jwt from "jsonwebtoken";
import { generateToken } from "../../controllers/auth.controllers.js";
const getTokenFromHeader = (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

export const setUser = (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);
    
    if (!token) {
      return res.status(401).json({ 
        error: "Authentication required. Please login." 
      });
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
      (err, decoded) => {
        if (err) {
          if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
              error: "Token expired. Please login again." 
            });
          }
          return res.status(401).json({ 
            error: "Invalid token. Please login again." 
          });
        }
        req.user = decoded;
        next();
      }
    );
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ 
      error: "Internal server error during authentication" 
    });
  }
};

// Only log on initialization
if (process.env.NODE_ENV !== 'production') {
  console.log("JWT middleware initialized with secret:", process.env.JWT_SECRET ? '[SECRET]' : 'default');
}

export default setUser;