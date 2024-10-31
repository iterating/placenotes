import express from "express"
const router = express.Router()
import { renderNotes, allNotes, newNoteForm, newNote, editNote, deleteNote } from "../controllers/notes.controllers.js";
import Note from "../models/notes.js";
import users from "./users.js"
import {setUser, autoLogin} from "../middleware/auth.js"

router.get("/", setUser, renderNotes);
router.get("/all", allNotes);
router.get(/\/(new|create)/, setUser, newNoteForm);
router.post(/\/(new|create)/, setUser, newNote);
router.put("/:id", setUser, editNote);
router.delete("/:id", setUser, deleteNote);

router.get("/:time", setUser, (req, res) => {
  Note.findOne({ userId: req.user._id, time: req.params.time })
    .then((notes) => {
      res.send(notes);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving notes");
    });
})
router.put("/:time", setUser, (req, res) => {
  Note.findOneAndUpdate(
    { userId: req.user._id, time: req.params.time },
    { $set: req.body },
    { new: true }
  )
    .then((notes) => {
      res.send(notes);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error editing note");
    });
})

router.delete("/:time", setUser, (req, res) => {
  Note.findOneAndDelete(
    { userId: req.user._id, time: req.params.time }
  )
    .then((notes) => {
      res.send({ message: "Note deleted" });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error deleting note");
    });
})
router.get("/:id/edit", setUser, async (req, res) => {
  try {
    const note = await Note.findOne({ userId: req.user._id, _id: req.params.id });
    if (!note) {
      return res.status(404).send("Note not found");
    }
    res.render("noteEdit", { note });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving note");
  }
});

router.post("/:id/edit", setUser, async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { userId: req.user._id, _id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!note) {
      return res.status(404).send("Note not found");
    }
    res.redirect("/notes");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error editing note");
  }
});
router.get("/:location", setUser, (req, res) => {
  Note.find({ userId: req.user._id, location: req.params.location })
    .then((notes) => {
      res.send(notes);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving notes");
    });
})

const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const schema = buildSchema(`
  type Note {
    _id: ID!
    userId: ID!
    body: String
    time: String
    location: String
  }

  type Query {
    notes: [Note]
    note(id: ID!): Note
    notesAtLocation(location: String!): [Note]
  }

  type Mutation {
    addNote(body: String!, location: String!, time: String!): Note
    editNote(id: ID!, body: String!, location: String!, time: String!): Note
    deleteNote(id: ID!): Note
  }
`);

const root = {
  notes: async () => {
    return await Note.find({ userId: req.user._id });
  },
  note: async (args) => {
    return await Note.findOne({ userId: req.user._id, _id: args.id });
  },
  notesAtLocation: async (args) => {
    return await Note.find({ userId: req.user._id, location: args.location });
  },
  addNote: async (args) => {
    const note = new Note({
      userId: req.user._id,
      body: args.body,
      location: args.location,
      time: args.time,
    });
    return await note.save();
  },
  editNote: async (args) => {
    return await Note.findOneAndUpdate(
      { userId: req.user._id, _id: args.id },
      { $set: args },
      { new: true }
    );
  },
  deleteNote: async (args) => {
    return await Note.findOneAndDelete({ userId: req.user._id, _id: args.id });
  },
};

router.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

export default router
