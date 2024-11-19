import jwt from "jwt-express";
import { refreshToken, generateToken } from "../../controllers/auth.controllers.js";

const getTokenFromHeader = req => {
  console.log("Extracting token from header...");
  if (
    (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') ||
    (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
  ) {
    const token = req.headers.authorization.split(' ')[1];
    console.log("Token found:", token);
    return token;
  }
  console.log("No token found in header");
  return null;
};

export const setUser = jwt.init(process.env.JWT_SECRET || "defaultSecretKey", {
  userProperty: 'token',
  getToken: getTokenFromHeader,
});

console.log("JWT middleware initialized with secret:", process.env.JWT_SECRET || "secret");

export default setUser;

