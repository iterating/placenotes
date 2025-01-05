import express from "express";
import { auth } from "../middleware/auth.js";
import {
  allUsers,
  accountSet,
  searchUsers,
  sendFriendRequest
} from "../controllers/users.controllers.js";

const router = express.Router();

// Protect all routes
router.use(auth);

// User management routes
router.get("/all", allUsers);
router.post("/account/set", accountSet);

// User search and friend request routes
router.get("/search", searchUsers);
router.post("/friend-request", sendFriendRequest);

export default router;
