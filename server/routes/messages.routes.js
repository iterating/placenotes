import express from 'express';
import { setUser } from '../api/middleware/auth.js';
import {
  getMessagesByLocation,
  createMessage,
  getMessagesList,
  markMessageAsRead,
  deleteMessage,
  getMessage,
  getMessageReplies,
  toggleMessageHidden
} from '../controllers/messages.controllers.js';

const router = express.Router();

// Protect all routes
router.use(setUser);

// Message routes - order is important! Most specific routes first
router.get('/list', getMessagesList);
router.get('/nearby', getMessagesByLocation);
router.post('/create', createMessage);
router.get('/replies/:messageId', getMessageReplies); // endpoint to get all replies to a message
router.put('/:messageId/read', markMessageAsRead); // endpoint to mark message as read
router.put('/:messageId/hidden', toggleMessageHidden); // endpoint to toggle message hidden state

// These routes should be last as they use the parameter pattern that can match other routes
router.get('/:messageId', getMessage); // endpoint to get a single message by ID
router.delete('/:messageId', deleteMessage); // endpoint to delete a message

export default router;
