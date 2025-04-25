import mongoose from 'mongoose';
import Message from '../models/Message.js';
import User from '../models/User.js';

// Cache messages for 5 minutes
const messageCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const PAGE_SIZE = 20;

const getCacheKey = (longitude, latitude, radius, page) => 
  `${longitude},${latitude},${radius},${page}`;

const getListCacheKey = (userId, page) => 
  `list-${userId}-${page}`;

const clearCacheEntry = (key) => {
  setTimeout(() => messageCache.delete(key), CACHE_DURATION);
};

export const getMessagesByLocation = async (req, res) => {
  try {
    const { longitude, latitude, radius, page = 1 } = req.query;
    const parsedPage = parseInt(page);
    
    if (!longitude || !latitude || !radius) {
      return res.status(400).json({ 
        message: 'Missing required parameters: longitude, latitude, radius' 
      });
    }

    // Parse coordinates and radius once
    const coords = [parseFloat(longitude), parseFloat(latitude)];
    const maxDistance = parseFloat(radius);
    
    // Check cache first
    const cacheKey = getCacheKey(longitude, latitude, radius, parsedPage);
    if (messageCache.has(cacheKey)) {
      return res.json(messageCache.get(cacheKey));
    }

    // Use MongoDB aggregation pipeline for geospatial query
    const pipeline = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: coords
          },
          distanceField: 'distance',
          maxDistance: maxDistance,
          spherical: true,
          query: {} // Additional query conditions can be added here
        }
      },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          messages: [
            { $skip: (parsedPage - 1) * PAGE_SIZE },
            { $limit: PAGE_SIZE },
            {
              $lookup: {
                from: 'users',
                localField: 'senderId',
                foreignField: '_id',
                as: 'sender'
              }
            },
            {
              $unwind: '$sender'
            },
            {
              $project: {
                _id: 1,
                content: 1,
                location: 1,
                radius: 1,
                read: 1,
                createdAt: 1,
                distance: 1,
                'sender._id': 1,
                'sender.username': 1,
                'sender.email': 1
              }
            }
          ]
        }
      }
    ];

    const [result] = await Message.aggregate(pipeline);
    
    const response = {
      messages: result.messages,
      pagination: {
        currentPage: parsedPage,
        totalPages: Math.ceil((result.metadata[0]?.total || 0) / PAGE_SIZE),
        totalMessages: result.metadata[0]?.total || 0
      }
    };

    // Cache the result
    messageCache.set(cacheKey, response);
    clearCacheEntry(cacheKey);

    res.json(response);
  } catch (error) {
    console.error('Error fetching messages by location:', error);
    res.status(500).json({ message: 'Error fetching messages by location' });
  }
};

export const createMessage = async (req, res) => {
  try {
    console.log('Message creation request body:', req.body);
    console.log('Current user:', req.user);

    const { content, location, radius, recipientId, parentMessageId } = req.body;
    const senderId = req.user._id; // Using _id instead of id

    // Basic validation (ensure required fields are present)
    if (!content || !location || !radius || !recipientId) {
      return res.status(400).json({ message: 'Missing required message fields: content, location, radius, recipientId' });
    }

    // Validate location format (simple check)
    if (!location.type || location.type !== 'Point' || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
        return res.status(400).json({ message: 'Invalid location format. Expected { type: "Point", coordinates: [longitude, latitude] }' });
    }

    // Validate recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient user not found' });
    }

    // Validate parent message if provided
    let parentMessage = null;
    if (parentMessageId) {
      if (!mongoose.Types.ObjectId.isValid(parentMessageId)) {
        return res.status(400).json({ message: 'Invalid parent message ID format' });
      }
      parentMessage = await Message.findById(parentMessageId);
      if (!parentMessage) {
        return res.status(404).json({ message: 'Parent message not found' });
      }
    }

    const newMessage = new Message({
      senderId,
      recipientId,
      content,
      location,
      radius,
      parentMessage: parentMessageId || null, // Store parent ID if exists
      // Default values for read and hidden are set in the schema
    });

    await newMessage.save();

    // Populate sender information for the response
    const populatedMessage = await Message.findById(newMessage._id)
        .populate('senderId', 'username email _id') // Populate sender details
        .lean(); // Use lean for a plain JS object

    // Clear recipient's message list cache (assuming pagination)
    // We don't know which page the new message will appear on, so clear all for simplicity
    // A more sophisticated approach might only clear page 1 or specific pages if known
    for (const key of messageCache.keys()) {
      if (key.startsWith(`list-${recipientId}-`)) {
        messageCache.delete(key);
        console.log(`Cleared cache key: ${key}`);
      }
    }

    // Note: Location-based cache invalidation is harder here without knowing
    // which specific location queries this new message might affect.
    // A robust solution might involve a different caching strategy (e.g., Redis with tags).

    // Format the response to match expectations (if necessary)
    const responseMessage = {
        ...populatedMessage,
        sender: populatedMessage.senderId, // Rename senderId to sender
    };
    delete responseMessage.senderId; // Remove the original senderId field

    res.status(201).json(responseMessage);

  } catch (error) {
    console.error('Error creating message:', error);

    // Handle potential Mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    // Handle potential duplicate key errors (if applicable)
    if (error.code === 11000) {
        return res.status(409).json({ message: 'Duplicate key error.', errorInfo: error.keyValue });
    }
    // Handle CastError (e.g., invalid ObjectId format)
    if (error.name === 'CastError') {
      return res.status(400).json({ message: `Invalid ID format for field: ${error.path}`, value: error.value });
    }

    res.status(500).json({ message: 'Error creating message', error: error.message });
  }
};

export const getMessagesList = async (req, res) => {
  try {
    console.log('getMessagesList called with user:', req.user);
    const userId = req.user._id;
    const { page = 1 } = req.query;
    const parsedPage = parseInt(page);
    
    console.log(`Fetching messages for user ID: ${userId}, page: ${parsedPage}`);
    
    // For debugging: do a direct count to see if any messages exist
    try {
      const msgCount = await Message.countDocuments({ recipientId: userId });
      console.log(`Found ${msgCount} messages with recipientId: ${userId} directly`);
      
      // If messages exist but weren't showing up, try to fetch one directly for debugging
      if (msgCount > 0) {
        const sampleMsg = await Message.findOne({ recipientId: userId }).lean();
        console.log('Sample message found:', sampleMsg);
      }
    } catch (countErr) {
      console.error('Error during direct message count:', countErr);
    }

    // Check cache first
    const cacheKey = getListCacheKey(userId, parsedPage);
    if (messageCache.has(cacheKey)) {
      console.log('Using cached message list');
      return res.json(messageCache.get(cacheKey));
    }

    // Get messages where user is either sender or recipient, sorted by createdAt desc (newest first)
    // Important: Try both string and ObjectId formats for IDs to handle different storage formats
    const userIdObj = new mongoose.Types.ObjectId(userId);
    
    const pipeline = [
      {
        $match: {
          $or: [
            // Where user is recipient
            { recipientId: userId },
            { recipientId: userIdObj },
            // Where user is sender
            { senderId: userId },
            { senderId: userIdObj }
          ]
        }
      },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          messages: [
            { $sort: { createdAt: -1 } },
            { $skip: (parsedPage - 1) * PAGE_SIZE },
            { $limit: PAGE_SIZE },
            {
              $lookup: {
                from: 'users',
                localField: 'senderId',
                foreignField: '_id',
                as: 'sender'
              }
            },
            {
              $addFields: {
                // Ensure we have a sender, even if the lookup didn't find one
                sender: { $ifNull: [{ $arrayElemAt: ['$sender', 0] }, { name: 'Unknown', email: '' }] }
              }
            },
            {
              $project: {
                _id: 1,
                senderId: 1,
                recipientId: 1,
                content: 1,
                location: 1,
                radius: 1,
                read: 1,
                createdAt: 1,
                updatedAt: 1,
                'sender._id': 1,
                'sender.name': 1,
                'sender.email': 1,
                // Try multiple possible sender name fields to ensure we get something
                'senderName': { 
                  $ifNull: [
                    '$sender.name', 
                    { $ifNull: ['$sender.username', '$sender.email'] }
                  ] 
                },
                // Flag to indicate if the message was sent by the current user
                'isSentByCurrentUser': {
                  $or: [
                    { $eq: [{ $toString: '$senderId' }, { $toString: userIdObj }] },
                    { $eq: ['$senderId', userIdObj] }
                  ]
                }
              }
            }
          ]
        }
      }
    ];
    
    console.log('Message pipeline match condition:', {
      $or: [
        { recipientId: userId },
        { recipientId: userIdObj },
        { senderId: userId },
        { senderId: userIdObj }
      ]
    });

    console.log('Running MongoDB aggregate pipeline for messages list');
    const [result] = await Message.aggregate(pipeline);
    console.log(`MongoDB query complete. Found metadata:`, result.metadata);
    console.log(`Messages found:`, result.messages.length);
    
    // Debug: Print message details if any found
    if (result.messages.length > 0) {
      console.log('First message details:', {
        id: result.messages[0]._id,
        senderId: result.messages[0].senderId,
        recipientId: result.messages[0].recipientId,
        senderName: result.messages[0].senderName,
        contentPreview: result.messages[0].content.substring(0, 20) + '...',
      });
    } else {
      // If no messages found through aggregation, try direct query for comparison
      try {
        const directMessages = await Message.find({ recipientId: userId }).limit(5).lean();
        console.log(`Direct query found ${directMessages.length} messages`);
        if (directMessages.length > 0) {
          console.log('Direct query first message:', directMessages[0]);
        }
      } catch (directErr) {
        console.error('Error during direct message query:', directErr);
      }
    }

    const response = {
      messages: result.messages,
      pagination: {
        currentPage: parsedPage,
        totalPages: Math.ceil((result.metadata[0]?.total || 0) / PAGE_SIZE),
        totalMessages: result.metadata[0]?.total || 0
      }
    };
    
    console.log('Sending response with pagination:', response.pagination);
    console.log('Final response message count:', response.messages.length);
    
    // Add detailed debugging for the first few messages if any
    if (response.messages.length > 0) {
      response.messages.slice(0, 3).forEach((msg, i) => {
        console.log(`Message ${i + 1} details:`, {
          id: msg._id,
          content: msg.content.substring(0, 30) + (msg.content.length > 30 ? '...' : ''),
          sender: msg.senderName || 'Unknown',
          date: msg.createdAt
        });
      });
    }
    
    // Cache the result
    messageCache.set(cacheKey, response);
    clearCacheEntry(cacheKey);

    res.json(response);
  } catch (error) {
    console.error('Error fetching messages list:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

/**
 * Mark a message as read
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object 
 */
export const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;
    
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Allow both the sender and recipient to mark messages as read
    const isRecipient = message.recipientId.toString() === userId;
    const isSender = message.senderId.toString() === userId;
    
    if (!isRecipient && !isSender) {
      return res.status(403).json({ message: 'Not authorized to mark this message as read' });
    }
    
    // Only update read status if user is the recipient
    // (sender's messages are automatically considered read)
    
    // Update the message if the user is the recipient
    if (isRecipient && !message.read) {
      message.read = true;
      await message.save();
      console.log(`Message ${messageId} marked as read by recipient ${userId}`);
    } else {
      console.log(`Message ${messageId} already read or marked by sender ${userId}`);
    }
    
    // Clear any list cache entries for this user
    for (const key of messageCache.keys()) {
      if (key.startsWith(`list-${userId}`)) {
        messageCache.delete(key);
      }
    }
    
    res.json({ success: true, message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Error marking message as read' });
  }
};

/**
 * Get a specific message by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getMessage = async (req, res) => {
  console.log('==== getMessage CALLED ====');
  console.log('Request params:', req.params);
  console.log('Request query:', req.query);
  
  try {
    const { messageId } = req.params;
    const userId = req.user._id;
    console.log('Getting message with ID:', messageId);
    
    // Simple validation
    if (!messageId) {
      console.error('No messageId provided in params');
      return res.status(400).json({ message: 'Message ID is required' });
    }
    
    try {
      // Find the message in the database
      const message = await Message.findById(messageId)
        .populate('senderId', 'username email _id') // Populate sender details
        .exec();
      
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }
      
      // Check if user has permission to view this message
      // User should be either the sender or recipient
      if (message.senderId._id.toString() !== userId.toString() && 
          message.recipientId.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Not authorized to view this message' });
      }
      
      // Format the message for response
      const formattedMessage = {
        _id: message._id,
        content: message.content,
        senderId: message.senderId._id,
        sender: message.senderId,
        recipientId: message.recipientId,
        parentMessageId: message.parentMessageId,
        conversationId: message.conversationId,
        location: message.location,
        read: message.read,
        hidden: message.hidden,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt
      };
      
      // If the user is the recipient and the message isn't read yet, mark it as read
      if (message.recipientId.toString() === userId.toString() && !message.read) {
        message.read = true;
        await message.save();
        console.log('Message marked as read:', messageId);
      }
      
      return res.status(200).json(formattedMessage);
    } catch (dbError) {
      console.error('Database error fetching message:', dbError);
      return res.status(500).json({ message: 'Failed to fetch message', error: dbError.toString() });
    }
  } catch (error) {
    console.error('Error in getMessage:', error);
    return res.status(500).json({ message: 'Server error', error: error.toString() });
  }
};

/**
 * Get all replies to a specific message
 * @param {Object} req - Express request object 
 * @param {Object} res - Express response object
 */
export const getMessageReplies = async (req, res) => {
  console.log('==== getMessageReplies CALLED ====');
  console.log('Request params:', req.params);
  console.log('Request query:', req.query);
  
  try {
    const { messageId } = req.params;
    console.log('Getting replies for message ID:', messageId);
    
    // Simple validation
    if (!messageId) {
      console.error('No messageId provided in params');
      return res.status(400).json({ message: 'Message ID is required' });
    }
    
    // Find all replies to this message
    try {
      const replies = await Message.find({ 
        parentMessageId: messageId,
        hidden: { $ne: true } // Exclude hidden messages
      })
      .populate('senderId', 'username email _id') // Populate sender details
      .sort({ createdAt: 1 }); // Sort by creation date ascending
      
      // Transform replies to include sender information in the expected format
      const formattedReplies = replies.map(reply => ({
        _id: reply._id,
        content: reply.content,
        senderId: reply.senderId._id,
        sender: reply.senderId,
        recipientId: reply.recipientId,
        parentMessageId: reply.parentMessageId,
        conversationId: reply.conversationId,
        location: reply.location,
        read: reply.read,
        hidden: reply.hidden,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt
      }));
      
      return res.status(200).json(formattedReplies);
    } catch (dbError) {
      console.error('Database error fetching replies:', dbError);
      return res.status(500).json({ message: 'Failed to fetch replies', error: dbError.toString() });
    }
  } catch (error) {
    console.error('Error in getMessageReplies:', error);
    return res.status(500).json({ message: 'Server error', error: error.toString() });
  }
};

/**
 * Delete a message
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object 
 */
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;
    
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Ensure the user is either the sender or recipient
    if (message.senderId.toString() !== userId.toString() && 
        message.recipientId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }
    
    // Delete the message
    await Message.findByIdAndDelete(messageId);
    
    // Clear any list cache entries for this user
    for (const key of messageCache.keys()) {
      if (key.startsWith(`list-${userId}`)) {
        messageCache.delete(key);
      }
    }
    
    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Error deleting message' });
  }
};

/**
 * Toggle the hidden state of a message
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const toggleMessageHidden = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;
    const { hidden } = req.body; // Should be a boolean value
    
    // Validate hidden parameter
    if (typeof hidden !== 'boolean') {
      return res.status(400).json({ message: 'Hidden parameter must be a boolean value' });
    }
    
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Ensure the user is either the sender or recipient
    if (message.senderId.toString() !== userId.toString() && 
        message.recipientId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this message' });
    }
    
    // Update the message hidden status
    message.hidden = hidden;
    await message.save();
    
    // Clear any list cache entries for this user
    for (const key of messageCache.keys()) {
      if (key.startsWith(`list-${userId}`)) {
        messageCache.delete(key);
      }
    }
    
    res.json({ 
      success: true, 
      messageId: message._id,
      hidden: message.hidden,
      message: `Message ${hidden ? 'hidden' : 'unhidden'} successfully`
    });
  } catch (error) {
    console.error('Error toggling message hidden state:', error);
    res.status(500).json({ message: 'Error updating message hidden state' });
  }
};

// Helper function to calculate distance between two points
function getDistance(point1, point2) {
  const [lon1, lat1] = point1;
  const [lon2, lat2] = point2;
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}
