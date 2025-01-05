import express from 'express';
import { auth } from '../middleware/auth.js';
import { searchUsers, sendFriendRequest } from '../controllers/user.controller.js';

const router = express.Router();

// Protect all routes
router.use(auth);

// Search users by email
router.get('/search', searchUsers);

// Send friend request
router.post('/friend-request', sendFriendRequest);

export default router;
