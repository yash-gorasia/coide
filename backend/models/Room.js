import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  roomName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: {
      type: String,
      required: true
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  fileCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries
roomSchema.index({ createdBy: 1, createdAt: -1 });
roomSchema.index({ 'participants.userId': 1 });

// Virtual for participant count
roomSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// Method to add participant
roomSchema.methods.addParticipant = function(userId, username) {
  // Check if participant already exists
  const existingParticipant = this.participants.find(
    p => p.userId.toString() === userId.toString()
  );
  
  if (!existingParticipant) {
    this.participants.push({
      userId,
      username,
      lastActive: new Date()
    });
  } else {
    // Update last active time
    existingParticipant.lastActive = new Date();
  }
  
  this.lastActivity = new Date();
  return this.save();
};

// Method to remove participant
roomSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(
    p => p.userId.toString() !== userId.toString()
  );
  this.lastActivity = new Date();
  return this.save();
};

// Method to update file count
roomSchema.methods.updateFileCount = function(count) {
  this.fileCount = count;
  this.lastActivity = new Date();
  return this.save();
};

export default mongoose.model('Room', roomSchema);