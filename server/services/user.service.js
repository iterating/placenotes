import User from '../models/User.js';

export const searchUsersByEmail = async (searchEmail, currentUserId) => {
  try {
    if (!searchEmail) {
      return [];
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, // Exclude current user
        { email: { $regex: searchEmail, $options: 'i' } } // Case-insensitive email search
      ]
    })
    .select('email name')
    .limit(10);

    return users;
  } catch (error) {
    console.error('Error in searchUsersByEmail service:', error);
    throw error;
  }
};

export const getUserFriendStatus = async (userId, targetUserId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if they're already friends
    const isFriend = user.friends.includes(targetUserId);

    // Check for pending friend request
    const hasPendingRequest = user.friendRequests.some(
      request => request.from.toString() === targetUserId.toString() && request.status === 'pending'
    );

    return {
      isFriend,
      hasPendingRequest
    };
  } catch (error) {
    console.error('Error in getUserFriendStatus service:', error);
    throw error;
  }
};

export const addFriendRequest = async (fromUserId, toUserId) => {
  try {
    const toUser = await User.findById(toUserId);
    if (!toUser) {
      throw new Error('Target user not found');
    }

    // Check if request already exists
    const existingRequest = toUser.friendRequests.find(
      request => request.from.toString() === fromUserId.toString() && request.status === 'pending'
    );

    if (existingRequest) {
      throw new Error('Friend request already sent');
    }

    // Add the friend request
    toUser.friendRequests.push({
      from: fromUserId,
      status: 'pending'
    });

    await toUser.save();
    return true;
  } catch (error) {
    console.error('Error in addFriendRequest service:', error);
    throw error;
  }
};
