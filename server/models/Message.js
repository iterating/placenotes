import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    auto: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true
  },
  content: {
    type: String,
    required: true,
    trim: true
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
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create indexes
messageSchema.index({ location: '2dsphere' });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ senderId: 1, recipientId: 1 });

// Create function to ensure indexes
const createMessageIndexes = async () => {
  try {
    const Message = mongoose.model('Message');
    await Message.syncIndexes();
    console.log('Message indexes created successfully');
  } catch (error) {
    console.error('Error creating message indexes:', error);
  }
};

// Create the model
const Message = mongoose.model('Message', messageSchema);

// Create indexes when the model is first loaded
createMessageIndexes();

export default Message;
