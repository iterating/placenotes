// import express from "express";
// const router = express.Router();
// import mongoose from "mongoose";
// import userSchema from "../models/users.js";
// import notes from "./notes.js";
// import passport from "../middleware/passport.js";
// import bcrypt from "bcrypt";

// // Get all users
// router.get("/all", async (req, res) => {
//   try {
//     let users = await userSchema.find().exec();
//     res.status(200).send(users);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error getting users");
//   }
// });

// // Create user
// router.post("/new", async (req, res) => {
//   try {
//     const hashedPassword = await bcrypt.hash(req.body.password, 1);
//     const newUser = new userSchema({
//       _id: new mongoose.Types.ObjectId(),
//       email: req.body.email,
//       password: hashedPassword,
//     });
//     let result = await newUser.save();
//     res.status(201).send(result);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error creating user");
//   }
// });

// export default router;

