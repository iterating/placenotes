import { searchUsersByEmail, getUserFriendStatus, addFriendRequest } from '../services/user.service.js';

export const searchUsers = async (req, res) => {
  try {
    const { email } = req.query;
    const currentUserId = req.user._id;

    if (!email || email.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    // Search for users
    const users = await searchUsersByEmail(email.trim(), currentUserId);

    // Get friend status for each user
    const usersWithStatus = await Promise.all(
      users.map(async (user) => {
        const status = await getUserFriendStatus(currentUserId, user._id);
        return {
          _id: user._id,
          email: user.email,
          name: user.name,
          ...status
        };
      })
    );

    res.status(200).json({
      success: true,
      users: usersWithStatus
    });
  } catch (error) {
    console.error('Error in searchUsers controller:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching users'
    });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const fromUserId = req.user._id;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Target user ID is required'
      });
    }

    // Check if trying to add self
    if (targetUserId === fromUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send friend request to yourself'
      });
    }

    await addFriendRequest(fromUserId, targetUserId);

    res.status(200).json({
      success: true,
      message: 'Friend request sent successfully'
    });
  } catch (error) {
    console.error('Error in sendFriendRequest controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error sending friend request'
    });
  }
};
