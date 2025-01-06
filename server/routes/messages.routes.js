import express from 'express';
import { setUser } from '../api/middleware/auth.js';
import {
  getMessagesByLocation,
  createMessage
} from '../controllers/messages.controllers.js';

const router = express.Router();

// Protect all routes
router.use(setUser);

// Message routes
router.get('/nearby', getMessagesByLocation);
router.post('/create', createMessage);

export default router;
