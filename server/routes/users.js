import express from "express";
import {
  login,
  logout,
  signup,
} from "../controllers/auth.controllers.js";
import {
  allUsers,

} from "../controllers/users.controllers.js";

import User from "../models/Users.js";
const router = express.Router();


const loginForm = (req, res) => {
  console.log("Entering loginForm route");
  console.log("req.session:", req.session);
  res.render("login", {
    errorMessage: req.flash("errorMessage"),
  });
};

const signupForm = (req, res) => {
  res.render("signup", {
    errorMessage: req.flash("errorMessage"),
  });
};


//!! Remove for production //!!
router.get("/all", allUsers);

router.route("/signup")
.get(signupForm)
.post(signup);

router.route(/\/(login|signup)/)
.get(loginForm)
.post(login);
//q4 reach
// router.post("/login", accountSettings);
router.get("/logout", logout);

// Get user by /users?id=:id or /users/:id
router.get("/", async (req, res) => {
  try {
    const users = req.query.name
      ? await User.find({ name: req.query.name }).lean()
      : await User.find().lean();
    res.send(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error finding users" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { id, name, group, email } = req.query;
    const query = {};
    if (id) query._id = id;
    if (name) query.name = name;
    if (group) query.group = group;
    if (email) query.email = email;
    const user = await User.findOne(query).lean();
    res.send(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error finding user" });
  }
});

// Find users by name
router.get("/name/:name", (req, res) => {
  User.find({ name: req.params.name })
    .then((user) => res.send(user))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Error finding user" });
    });
});
// find user by email
router.get("/email/:email", (req, res) => {
  User.find({ email: req.params.email })
    .then((user) => res.send(user))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Error finding user" });
    });
});
// find user by group
router.get("/group/:group", (req, res) => {
  User.find({ group: req.params.group })
    .then((user) => res.send(user))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Error finding user" });
    });
});
//find user by id and time
router.get("/:id", (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      const time = req.query.time;
      const notes = user.notes.filter((note) => note.time.toString() === time);
      res.send(notes);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Error retrieving notes" });
    });
});

router.get("/:id/time/:time", (req, res) => {
  const user = User.findById(req.params.id);
  const notes = user.notes.filter((note) => note.time === req.params.time);
  res.send(notes);
});

//router to get a user's notes sorted by most recent
router.get("/:id/recent", (req, res) => {
  Note.find({ userId: req.params.id })
    .sort({ time: -1 })
    .then((notes) => res.send(notes))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Error retrieving notes" });
    });
});

//route to get a a user's notes sorted by oldest
router.get("/:id/oldest", (req, res) => {
  const user = User.findById(req.params.id);
  const notes = user.notes.sort((a, b) => a.time - b.time);
  res.send(notes);
});

// Notes by ID
router.get("/:id/notes", async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.params.id }).lean();
    res.send(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error retrieving notes" });
  }
});

router.get("/:id/notes/:noteId", async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.noteId,
      userId: req.params.id,
    }).lean();

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.send(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error retrieving note" });
  }
});

router.put("/:id/notes/:noteId", async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.noteId, userId: req.params.id },
      { $set: req.body },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.send(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating note" });
  }
});

router.delete("/:id/notes/:noteId", async (req, res) => {
  try {
    const result = await Note.deleteOne({
      _id: req.params.noteId,
      userId: req.params.id,
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.send({ message: "Note deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting note" });
  }
});



export default router;
