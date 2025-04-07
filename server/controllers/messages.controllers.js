import Message from '../models/Message.js';

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
    const { content, location, radius, recipientId } = req.body;
    const senderId = req.user.id;

    const message = new Message({
      senderId,
      recipientId,
      content,
      location: {
        type: 'Point',
        coordinates: location.coordinates
      },
      radius
    });

    await message.save();

    // Clear cache entries that might contain this location
    for (const key of messageCache.keys()) {
      // Clear location-based cache entries
      if (key.includes(',')) {
        const [cacheLong, cacheLat, cacheRadius] = key.split(',').map(parseFloat);
        const distance = getDistance(
          [cacheLong, cacheLat],
          location.coordinates
        );
        if (distance <= parseFloat(cacheRadius)) {
          messageCache.delete(key);
        }
      } 
      // Clear any list cache entries for the recipient
      else if (key.startsWith(`list-${recipientId}`)) {
        messageCache.delete(key);
      }
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ message: 'Error creating message' });
  }
};

/**
 * Get messages by received time (inbox)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getMessagesList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1 } = req.query;
    const parsedPage = parseInt(page);

    // Check cache first
    const cacheKey = getListCacheKey(userId, parsedPage);
    if (messageCache.has(cacheKey)) {
      return res.json(messageCache.get(cacheKey));
    }

    // Get messages received by the user, sorted by createdAt desc (newest first)
    const pipeline = [
      {
        $match: { recipientId: userId }
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
                'sender._id': 1,
                'sender.username': 1,
                'sender.email': 1,
                // Include sender name for UI display
                'senderName': '$sender.username'
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
    const userId = req.user.id;
    
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Ensure the user is the recipient
    if (message.recipientId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to mark this message as read' });
    }
    
    // Update the message
    message.read = true;
    await message.save();
    
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
