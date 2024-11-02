import mongoose from 'mongoose';
import User from "../models/Users.js"
import Note from "../models/Notes.js"

async function seedDatabase() {
  await mongoose.connect(process.env.ATLAS_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const users = [
    {
      _id: new mongoose.Types.ObjectId(),
      email: 'john.doe@example.com',
      name: 'John Doe',
      password: 'hashed_password1'
    },
    {
      _id: new mongoose.Types.ObjectId(),
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      password: 'hashed_password2'
    }
  ];

  const notes = [
    {
      _id: new mongoose.Types.ObjectId(),
      userId: users[0]._id.toString(),
      email: 'john.doe@example.com',
      location: { lat: '37.7749', lon: '-122.4194' },
      time: new Date().toISOString(),
      body: 'This is a note from John Doe.'
    },
    {
      _id: new mongoose.Types.ObjectId(),
      userId: users[1]._id.toString(),
      email: 'jane.smith@example.com',
      location: { lat: '40.7128', lon: '-74.0060' },
      time: new Date().toISOString(),
      body: 'This is a note from Jane Smith.'
    }
  ];

  await User.insertMany(users);
  await Note.insertMany(notes);

  console.log('Database seeded successfully');
  mongoose.connection.close();
}

seedDatabase().catch(err => console.error('Error seeding database:', err));
