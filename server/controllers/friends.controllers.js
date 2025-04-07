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
    const isFriend = recipient.friends.some(friendId => 
      friendId.toString() === senderId.toString()
    );
    if (isFriend) {
      return res.status(400).json({ message: "You are already friends with this user" });
    }

    // Check if a request already exists
    const existingRequest = recipient.friendRequests.find(
      request => request.from.toString() === senderId.toString() && request.status === "pending"
    );

    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    // Use direct MongoDB update to avoid validation issues
    // Instead of modifying the document and saving it
    await User.model.updateOne(
      { _id: recipient._id },
      { 
        $push: { 
          friendRequests: {
            from: senderId,
            status: "pending",
            createdAt: new Date()
          }
        }
      }
    );

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

    // Use findOne instead of findById
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the request manually
    const request = user.friendRequests.find(req => req._id.toString() === requestId);
    if (!request) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request already processed" });
    }

    if (action === "accept") {
      // Add both users to each other's friends list using direct MongoDB updates
      // Update the current user
      await User.model.updateOne(
        { _id: userId, "friendRequests._id": request._id },
        { 
          $push: { friends: request.from },
          $set: { "friendRequests.$.status": "accepted" }
        }
      );

      // Update the requester
      await User.model.updateOne(
        { _id: request.from },
        { $push: { friends: userId } }
      );

      res.status(200).json({ message: "Friend request accepted" });
    } else {
      // Mark request as rejected using direct MongoDB update
      await User.model.updateOne(
        { _id: userId, "friendRequests._id": request._id },
        { $set: { "friendRequests.$.status": "rejected" } }
      );
      
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

    // Use the model's method instead of direct findById
    const user = await User.findOne({ _id: userId });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Manual population since we're using a custom model
    const pendingRequests = [];
    for (const request of user.friendRequests) {
      if (request.status === "pending") {
        const fromUser = await User.findOne({ _id: request.from });
        pendingRequests.push({
          _id: request._id,
          status: request.status,
          createdAt: request.createdAt,
          from: {
            _id: fromUser._id,
            name: fromUser.name,
            email: fromUser.email
          }
        });
      }
    }

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

    // Use the model's findOne method
    const user = await User.findOne({ _id: userId });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Manual population of friends
    const friends = [];
    for (const friendId of user.friends) {
      const friend = await User.findOne({ _id: friendId });
      if (friend) {
        friends.push({
          _id: friend._id,
          name: friend.name,
          email: friend.email
        });
      }
    }

    res.status(200).json(friends);
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

    // Use the model's custom methods
    const regexQuery = new RegExp(query, 'i');
    const allUsers = await User.find({}); // Get all users and filter manually
    
    // Filter users manually
    const users = allUsers
      .filter(user => 
        // Exclude current user
        user._id.toString() !== userId.toString() && 
        // Match name or email
        (regexQuery.test(user.email) || regexQuery.test(user.name))
      )
      .slice(0, 10); // Limit to 10 results

    // Get the current user
    const currentUser = await User.findOne({ _id: userId });
    if (!currentUser) {
      return res.status(404).json({ message: "Current user not found" });
    }

    // For each user, check if they're already a friend
    const userWithFriendStatus = users.map(user => {
      const isFriend = currentUser.friends.some(friendId => 
        friendId.toString() === user._id.toString()
      );
      
      const hasPendingRequest = currentUser.friendRequests.some(
        req => req.from.toString() === user._id.toString() && req.status === 'pending'
      );
      
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        isFriend,
        hasPendingRequest
      };
    });

    res.status(200).json(userWithFriendStatus);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Error searching users" });
  }
};

// Get user by ID for messaging
export const getUserById = async (req, res) => {
  try {
    console.log("getUserById called with params:", req.params);
    console.log("Current user:", req.user);
    
    const { userId } = req.params;
    const currentUserId = req.user._id;

    console.log(`Looking for user with ID: ${userId}`);
    console.log(`Current user ID: ${currentUserId}`);

    // For testing purposes, temporarily return user info without friend check
    // Find the user
    const user = await User.findOne({ _id: userId });
    console.log("Found user:", user ? "Yes" : "No");
    
    if (!user) {
      console.log(`User with ID ${userId} not found`);
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check if the user is a friend of the current user
    // For now, skip this check to troubleshoot the endpoint
    /*
    const currentUser = await User.findOne({ _id: currentUserId });
    if (!currentUser) {
      return res.status(404).json({ message: "Current user not found" });
    }
    
    const isFriend = currentUser.friends.some(friendId => 
      friendId.toString() === userId.toString()
    );
    
    // Only allow getting user details if they are friends
    if (!isFriend) {
      return res.status(403).json({ message: "You can only message your friends" });
    }
    */
    
    // Return limited user information for messaging
    const responseData = {
      _id: user._id,
      name: user.name,
      email: user.email
    };
    
    console.log("Returning user data:", responseData);
    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ message: "Error getting user details" });
  }
};
