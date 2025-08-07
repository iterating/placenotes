// d:\studio\atelier\placenotes\server\api\routes\users.routes.js

import express from "express";
import { setUser } from "../middleware/auth.js";
import {
  allUsers,
  accountSet,
  searchUsers,
  sendFriendRequest,
  getUserByName,
  getUserByEmail
} from "../../controllers/users.controllers.js";

const router = express.Router();

// Protect all subsequent routes in this file
router.use(setUser);

// User management routes
router.get("/all", allUsers); // Keep the one from userRoutes.js? Check controller logic.
router.post("/account/set", accountSet);
router.post("/account", accountSet);


// User search and friend request routes
router.get("/search", searchUsers); // Uses controller, preferred over direct service call
router.post("/friend-request", sendFriendRequest);

// Specific user lookup routes (adapted from userRoutes.js)
router.get("/name/:name", getUserByName);
router.get("/email/:email", getUserByEmail);

// Potential future routes (e.g., get user by ID)
// router.get("/:id", getUserById);

export default router;
