import path from "path"
import express from "express"
import * as authController from "../../controllers/auth.controllers.js"
import * as usersController from "../../controllers/users.controllers.js"
import { setUser } from "../middleware/auth.js"
import * as notesService from "../../services/notes.service.js"
import * as usersService from "../../services/users.service.js"

const router = express.Router()

const loginForm = (req, res) => {
  console.log("Entering loginForm route")
  console.log("req.session:", req.session)
  res.render("login", {
    errorMessage: req.flash("errorMessage"),
  })
}

const signupForm = (req, res) => {
  res.render("signup", {
    errorMessage: req.flash("errorMessage"),
  })
}

const accountSettings = (req, res) => {
  res.status(200).json({
    errorMessage: req.flash("errorMessage"),
  });
}

//!! Remove for production //!!
router.get("/all", usersController.allUsers)

router.route("/signup").get(signupForm).post(authController.signup)

router
  .route(/\/(login|signup)/)
  .get(loginForm)
  .post(authController.login)
//q4 reach
// router.post("/login", accountSettings);
router.get("/logout", authController.logout)
router
  .route("/account")
  .get(setUser, accountSettings)
  .post(setUser, usersController.accountSet)

router.get("/", async (req, res) => {
  try {
    const query = req.query.name ? { name: req.query.name } : {};
    const users = await usersService.findUsers(query);
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
    const user = await usersService.findOneUser(query);
    res.send(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error finding user" });
  }
});

router.get("/name/:name", async (req, res) => {
  try {
    const users = await usersService.findUsers({ name: req.params.name });
    res.send(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error finding user" });
  }
});

router.get("/email/:email", async (req, res) => {
  try {
    const user = await usersService.findByEmail(req.params.email)
    res.send(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error finding user" })
  }
});

router.get("/group/:group", async (req, res) => {
  try {
    const user = await usersService.findByGroup(req.params.group)
    res.send(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error finding user" })
  }
});

// router.get("/:id", async (req, res) => {
//   try {
//     const time = req.query.time
//     const notes = await usersService.findUserNotesByIdAndTime(req.params.id, time)
//     res.send(notes)
//   } catch (err) {
//     console.error(err)
//     res.status(500).json({ error: "Error retrieving notes" })
//   }
// });

router.get("/:id/time/:time", async (req, res) => {
  try {
    const notes = await usersService.findUserNotesByIdAndTime(req.params.id, req.params.time)
    res.send(notes)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error retrieving notes" })
  }
});

router.get("/:id/recent", async (req, res) => {
  try {
    const notes = await notesService.recentNotes(req.params.id)
    res.send(notes)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error retrieving notes" })
  }
});

router.get("/:id/oldest", async (req, res) => {
  try {
    const notes = await notesService.oldestNotes(req.params.id)
    res.send(notes)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error retrieving notes" })
  }
});

router.get("/:id/notes", async (req, res) => {
  try {
    const notes = await notesService.getUserNotes(req.params.id)
    res.send(notes)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error retrieving notes" })
  }
});

router.get("/:id/notes/:noteId", async (req, res) => {
  try {
    const note = await notesService.getUserNoteById(req.params.id, req.params.noteId)
    if (!note) {
      return res.status(404).json({ error: "Note not found" })
    }
    res.send(note)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error retrieving note" })
  }
});

router.put("/:id/notes/:noteId", async (req, res) => {
  try {
    const note = await notesService.updateUserNote(req.params.id, req.params.noteId, req.body)
    if (!note) {
      return res.status(404).json({ error: "Note not found" })
    }
    res.send(note)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error updating note" })
  }
});

router.delete("/:id/notes/:noteId", async (req, res) => {
  try {
    const result = await notesService.deleteUserNote(req.params.id, req.params.noteId)
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Note not found" })
    }
    res.send({ message: "Note deleted" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error deleting note" })
  }
});

export default router

