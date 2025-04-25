import express from "express";
import { setUser } from "../../api/middleware/auth.js"; 
import {
  sendFriendRequest,
  respondToFriendRequest,
  getPendingRequests,
  getFriends,
  searchUsers,
  getUserById
} from "../../controllers/friends.controllers.js"; 

const router = express.Router();

// All routes require authentication
router.use(setUser);

// Friend request routes
router.post("/request", sendFriendRequest);
router.post("/respond", respondToFriendRequest);
router.get("/pending", getPendingRequests);
router.get("/list", getFriends);
router.get("/search", searchUsers);
router.get("/user/:userId", getUserById);

export default router;
