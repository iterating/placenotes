// // import express from "express";
// // const router = express.Router();
// // import mongoose from "mongoose";
// // import userSchema from "../models/users.js";
// // import notes from "./notes.js";
// // import passport from "../middleware/passport.js";
// // import bcrypt from "bcrypt";

// // // Get all users
// // router.get("/all", async (req, res) => {
// //   try {
// //     let users = await userSchema.find().exec();
// //     res.status(200).send(users);
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).send("Error getting users");
// //   }
// // });

// // // Create user
// // router.post("/new", async (req, res) => {
// //   try {
// //     const hashedPassword = await bcrypt.hash(req.body.password, 1);
// //     const newUser = new userSchema({
// //       _id: new mongoose.Types.ObjectId(),
// //       email: req.body.email,
// //       password: hashedPassword,
// //     });
// //     let result = await newUser.save();
// //     res.status(201).send(result);
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).send("Error creating user");
// //   }
// // });

// // export default router;

// router.get("/all", async (req, res) => {
//     try {
//         let notes = await noteSchema.find().populate('userId', 'name email');
//         res.send(notes);
//       } catch (err) {
//         console.log(err);
//         res.status(500).send("Error getting notes");
//       }
// });

// router.get("/:noteId", isAuthenticated, async (req, res) => {
//     try {
//         const note = await noteSchema.findById(req.params.noteId);
//         if (!note) {
//             return res.status(404).json({
//                 error: "No note with this id"
//             });
//         }
//         if (note.userId.toString() !== req.userData._id.toString()) {
//             return res.status(403).json({
//                 error: "No permission to access this note"
//             });
//         }
//         res.status(200).json({
//             note,
//             request: {
//                 type: "GET",
//                 url: "http://localhost:3000/notes/"
//             }
//         });
//     } catch (err) {
//         res.status(500).json({
//             error: err
//         });
//     }
// });


// // Get all notes by userId
// router.get("/:userId", async (req, res) => {
//   try {
//     let notes = await noteSchema.find({ userId: req.params.userId });
//     if (!notes) res.send("User Not found").status(404);
//     else res.send(notes).status(200);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error getting user data");
//   }
// });

// // Create a note
// router.post("/", isAuthenticated, async (req, res) => {
//   try {
//     const note = {
//       userId: req.userData._id,
//       location: {
//         lat: req.body.lat,
//         lon: req.body.lon
//       },
//       time: req.body.time,
//       body: req.body.body
//     };
//     let result = await noteSchema.create(note);
//     res.status(201).json({
//       note,
//       request: {
//         type: "POST",
//         url: "http://localhost:3000/notes/"
//       }
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       error: err
//     });
//   }
// });

