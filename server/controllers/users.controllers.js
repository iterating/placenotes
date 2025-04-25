import * as UserService from "../services/users.service.js";
import User from "../models/User.js";

export const allUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error getting users");
  }
};

export const accountSet = async (req, res) => {
  const { name, email } = req.body;
  try {
    await User.findByIdAndUpdate(req.user._id, { name, email });
    res.redirect("/notes");
  } catch (err) {
    console.error(err);
    res.status(400).send("Error updating user");
  }
};

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
    const users = await UserService.searchUsersByEmail(email.trim(), currentUserId);

    // Get friend status for each user
    const usersWithStatus = await Promise.all(
      users.map(async (user) => {
        const status = await UserService.getUserFriendStatus(currentUserId, user._id);
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

    await UserService.addFriendRequest(fromUserId, targetUserId);

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

// New controller function to get user by name
export const getUserByName = async (req, res) => {
  try {
    const name = req.params.name;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name parameter is required' });
    }
    // Assuming UserService.findUsers can handle a query object like { name: name }
    // Or perhaps a dedicated service function like UserService.findUsersByName(name) exists?
    // Using findUsers for now based on old userRoutes.js logic.
    const users = await UserService.findUsers({ name: name }); 
    res.status(200).json({ success: true, users: users });
  } catch (error) {
    console.error('Error in getUserByName:', error);
    res.status(500).json({ success: false, message: 'Error finding user(s) by name' });
  }
};

// New controller function to get user by email
export const getUserByEmail = async (req, res) => {
  try {
    const email = req.params.email;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email parameter is required' });
    }
    // Assuming UserService.findByEmail exists based on old userRoutes.js logic.
    const user = await UserService.findByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user: user });
  } catch (error) {
    console.error('Error in getUserByEmail:', error);
    res.status(500).json({ success: false, message: 'Error finding user by email' });
  }
};
