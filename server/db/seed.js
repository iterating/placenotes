import mongoose from "mongoose"
import User from "../models/User.js"
import Note from "../models/Note.js"
import Group from "../models/Group.js"
import db from "./conn.js"

const connectionString = process.env.ATLAS_URI
const dbName = process.env.DBNAME

async function seedDatabase() {
  await mongoose.connect(process.env.ATLAS_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  const users = [
    {
      _id: new mongoose.Types.ObjectId(),
      email: "john.doe@example.com",
      name: "John Doe",
      password: "hashed_password1",
    },
    {
      _id: new mongoose.Types.ObjectId(),
      email: "jane.smith@example.com",
      name: "Jane Smith",
      password: "hashed_password2",
    },
    {
      _id: new mongoose.Types.ObjectId(),
      email: "joe.bob@example.com",
      name: "Joe Bob",
      password: "hashed_password3",
    },
    {
      _id: new mongoose.Types.ObjectId(),
      email: "jane.doe@example.com",
      name: "Jane Doe",
      password: "hashed_password4",
    },
    {
      _id: new mongoose.Types.ObjectId(),
      email: "joe.smith@example.com",
      name: "Joe Smith",
      password: "hashed_password5",
    },
  ]
  const groups = [
    {
      _id: new mongoose.Types.ObjectId(),
      name: "Group 1",
      notes: [],
    },
    {
      _id: new mongoose.Types.ObjectId(),
      name: "Group 2",
      notes: [],
    },
  ]
  const notes = [
    {
      _id: new mongoose.Types.ObjectId(),
      userId: users[0]._id,
      email: users[0].email,
      location: { type: "Point", coordinates: [-122.4194, 37.7749] },
      radius: 100,
      time: new Date(),
      body: "This is a note from John Doe.",
    },
    {
      _id: new mongoose.Types.ObjectId(),
      userId: users[1]._id,
      email: users[1].email,
      location: { type: "Point", coordinates: [-74.006, 40.7128] },
      radius: 100,
      time: new Date(),
      body: "This is a note from Jane Smith.",
    },
    {
      _id: new mongoose.Types.ObjectId(),
      userId: users[2]._id,
      email: users[2].email,
      location: { type: "Point", coordinates: [-87.6298, 41.8781] },
      radius: 100,
      time: new Date(),
      body: "This is a note from Joe Bob.",
    },
    {
      _id: new mongoose.Types.ObjectId(),
      userId: users[3]._id,
      email: users[3].email,
      location: { type: "Point", coordinates: [-122.4194, 37.7749] },
      radius: 100,
      time: new Date(),
      body: "This is a note from Jane Doe.",
    },
    {
      _id: new mongoose.Types.ObjectId(),
      userId: users[4]._id,
      email: users[4].email,
      location: { type: "Point", coordinates: [-74.006, 40.7128] },
      radius: 100,
      time: new Date(),
      body: "This is a note from Joe Smith.",
    },
    {
      _id: new mongoose.Types.ObjectId(),
      userId: users[0]._id,
      email: users[0].email,    
      location: { type: "Point", coordinates: [-87.6298, 41.8781] },
      radius: 100,
      time: new Date(),
      body: "This is a note from John Doe.",
    },  


  ]

  await User.insertMany(users)
  await Note.insertMany(notes)

  console.log("Database seeded successfully")
  mongoose.connection.close()
}

seedDatabase().catch((err) => console.error("Error seeding database:", err))

