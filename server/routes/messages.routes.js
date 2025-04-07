import express from 'express';
import { setUser } from '../api/middleware/auth.js';
import {
  getMessagesByLocation,
  createMessage,
  getMessagesList,
  markMessageAsRead,
  deleteMessage
} from '../controllers/messages.controllers.js';

const router = express.Router();

// Protect all routes
router.use(setUser);

// Message routes
router.get('/list', getMessagesList); 
router.get('/nearby', getMessagesByLocation);
router.post('/create', createMessage);
router.put('/:messageId/read', markMessageAsRead); // endpoint to mark message as read
router.delete('/:messageId', deleteMessage); // endpoint to delete a message

export default router;
