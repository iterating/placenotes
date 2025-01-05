import mongoose from "mongoose"

const noteSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true
  },
  email: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: false,
    trim: true
  },
  body: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v) {
          return Array.isArray(v) && v.length === 2 &&
                 v[0] >= -180 && v[0] <= 180 && // longitude
                 v[1] >= -90 && v[1] <= 90;     // latitude
        },
        message: 'Coordinates must be a valid [longitude, latitude] pair'
      }
    }
  },
  radius: {
    type: Number,
    default: 1000, // Default radius in meters
    min: [0, 'Radius cannot be negative']
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ email: 1, createdAt: -1 });
noteSchema.index({ location: '2dsphere' });

// Update timestamps on save
noteSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Ensure location type is set
noteSchema.pre('save', function(next) {
  if (this.location && !this.location.type) {
    this.location.type = 'Point';
  }
  next();
});

const Note = mongoose.model("Note", noteSchema);

export const createNoteIndexes = async () => {
  try {
    await Note.collection.createIndex({ location: "2dsphere" });
    await Note.createIndexes();
    console.log('Note indexes created successfully');
  } catch (err) {
    console.error('Error creating Note indexes:', err);
    throw err;
  }
};

export default Note;
