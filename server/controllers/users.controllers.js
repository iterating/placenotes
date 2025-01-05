import User from "../models/User.js"

export const allUsers = async (req, res) => {
  try {
    const users = await User.find()
    res.json(users)
  } catch (err) {
    console.error(err)
    res.status(500).send("Error getting users")
  }
}

export const accountSet = async (req, res) => {
  const { name, email } = req.body
  try {
    await User.findByIdAndUpdate(req.user._id, { name, email })
    res.redirect("/notes")
  } catch (err) {
    console.error(err)
    res.status(400).send("Error updating user")
  }
}

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
    const users = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, // Exclude current user
        { email: { $regex: email.trim(), $options: 'i' } } // Case-insensitive email search
      ]
    })
    .select('email name')
    .limit(10);

    // Get friend status for each user
    const usersWithStatus = await Promise.all(
      users.map(async (user) => {
        const currentUser = await User.findById(currentUserId);
        const isFriend = currentUser.friends.includes(user._id);
        const hasPendingRequest = currentUser.friendRequests.some(
          req => req.from.toString() === user._id.toString() && req.status === 'pending'
        );

        return {
          _id: user._id,
          email: user.email,
          name: user.name,
          isFriend,
          hasPendingRequest
        };
      })
    );

    res.status(200).json({
      success: true,
      users: usersWithStatus
    });
  } catch (error) {
    console.error('Error in searchUsers:', error);
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

    const toUser = await User.findById(targetUserId);
    if (!toUser) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found'
      });
    }

    // Check if they're already friends
    if (toUser.friends.includes(fromUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Already friends with this user'
      });
    }

    // Check if request already exists
    const existingRequest = toUser.friendRequests.find(
      request => request.from.toString() === fromUserId.toString() && request.status === 'pending'
    );

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Friend request already sent'
      });
    }

    // Add the friend request
    toUser.friendRequests.push({
      from: fromUserId,
      status: 'pending'
    });

    await toUser.save();

    res.status(200).json({
      success: true,
      message: 'Friend request sent successfully'
    });
  } catch (error) {
    console.error('Error in sendFriendRequest:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error sending friend request'
    });
  }
};
