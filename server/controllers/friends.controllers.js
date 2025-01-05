import User from "../models/User.js";
import mongoose from "mongoose";

// Send friend request by email
export const sendFriendRequest = async (req, res) => {
  try {
    const { email } = req.body;
    const senderId = req.user._id; // From auth middleware

    // Find recipient by email
    const recipient = await User.findOne({ email });
    if (!recipient) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if sender is trying to add themselves
    if (recipient._id.toString() === senderId.toString()) {
      return res.status(400).json({ message: "You cannot send a friend request to yourself" });
    }

    // Check if they're already friends
    if (recipient.friends.includes(senderId)) {
      return res.status(400).json({ message: "You are already friends with this user" });
    }

    // Check if a request already exists
    const existingRequest = recipient.friendRequests.find(
      request => request.from.toString() === senderId.toString() && request.status === "pending"
    );

    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    // Add friend request
    recipient.friendRequests.push({
      from: senderId,
      status: "pending"
    });

    await recipient.save();
    res.status(200).json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ message: "Error sending friend request" });
  }
};

// Accept or reject friend request
export const respondToFriendRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body;
    const userId = req.user._id; // From auth middleware

    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the request
    const request = user.friendRequests.id(requestId);
    if (!request) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request already processed" });
    }

    if (action === "accept") {
      // Add both users to each other's friends list
      await User.updateOne(
        { _id: userId },
        { 
          $push: { friends: request.from },
          $set: { "friendRequests.$.status": "accepted" }
        }
      );

      await User.updateOne(
        { _id: request.from },
        { $push: { friends: userId } }
      );

      res.status(200).json({ message: "Friend request accepted" });
    } else {
      // Mark request as rejected
      request.status = "rejected";
      await user.save();
      res.status(200).json({ message: "Friend request rejected" });
    }
  } catch (error) {
    console.error("Error responding to friend request:", error);
    res.status(500).json({ message: "Error processing friend request" });
  }
};

// Get pending friend requests
export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware

    const user = await User.findById(userId)
      .populate({
        path: "friendRequests.from",
        select: "name email"
      });

    const pendingRequests = user.friendRequests.filter(
      request => request.status === "pending"
    );

    res.status(200).json(pendingRequests);
  } catch (error) {
    console.error("Error getting friend requests:", error);
    res.status(500).json({ message: "Error retrieving friend requests" });
  }
};

// Get friend list
export const getFriends = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware

    const user = await User.findById(userId)
      .populate({
        path: "friends",
        select: "name email"
      });

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error getting friends list:", error);
    res.status(500).json({ message: "Error retrieving friends list" });
  }
};

// Search users by email or name
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user._id;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Search for users by email or name, excluding the current user
    const users = await User.find({
      $and: [
        { _id: { $ne: userId } }, // Exclude current user
        {
          $or: [
            { email: { $regex: query, $options: 'i' } },
            { name: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    })
    .select('name email')
    .limit(10); // Limit results

    // For each user, check if they're already a friend
    const userWithFriendStatus = await Promise.all(users.map(async (user) => {
      const currentUser = await User.findById(userId);
      const isFriend = currentUser.friends.includes(user._id);
      const hasPendingRequest = currentUser.friendRequests.some(
        req => req.from.toString() === user._id.toString() && req.status === 'pending'
      );
      
      return {
        ...user.toObject(),
        isFriend,
        hasPendingRequest
      };
    }));

    res.status(200).json(userWithFriendStatus);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Error searching users" });
  }
};
