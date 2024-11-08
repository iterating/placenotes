import mongoose from 'mongoose';
import User from "../models/User.js"
import Note from "../models/Note.js"

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
      location: { type: 'Point', coordinates: [ -122.4194, 37.7749 ] },
      time: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(/[-:]/g, '').replace(' ', '-'),
      body: 'This is a note from John Doe.'
    },
    {
      _id: new mongoose.Types.ObjectId(),
      userId: users[1]._id.toString(),
      location: { type: 'Point', coordinates: [ -74.0060, 40.7128 ] },
      time: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(/[-:]/g, '').replace(' ', '-'),
      body: 'This is a note from Jane Smith.'
    }
  
  ];

  await User.insertMany(users);
  await Note.insertMany(notes);

  console.log('Database seeded successfully');
  mongoose.connection.close();
}

seedDatabase().catch(err => console.error('Error seeding database:', err));

