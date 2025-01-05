import express from "express";
import { auth } from "../middleware/auth.js";
import {
  sendFriendRequest,
  respondToFriendRequest,
  getPendingRequests,
  getFriends,
  searchUsers
} from "../controllers/friends.controllers.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Friend request routes
router.post("/request", sendFriendRequest);
router.post("/respond", respondToFriendRequest);
router.get("/pending", getPendingRequests);
router.get("/list", getFriends);
router.get("/search", searchUsers);

export default router;
