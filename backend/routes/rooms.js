import express from 'express';
import Room from '../models/Room.js';
import File from '../models/File.js';
import { authenticateToken } from '../middleware/auth.js';
import { body, validationResult, param } from 'express-validator';

const router = express.Router();

// @route   GET /api/rooms
// @desc    Get all rooms for a user (created by user or participated in)
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get rooms where user is creator or participant
    const rooms = await Room.find({
      $or: [
        { createdBy: userId },
        { 'participants.userId': userId }
      ],
      isActive: true
    })
    .populate('createdBy', 'username email')
    .sort({ lastActivity: -1 })
    .limit(50);

    // Get file count for each room and include participant count
    const roomsWithDetails = await Promise.all(
      rooms.map(async (room) => {
        const fileCount = await File.countDocuments({ roomId: room.roomId });
        const roomObj = room.toObject({ virtuals: true });
        roomObj.fileCount = fileCount;
        roomObj.participantCount = room.participants.length;
        return roomObj;
      })
    );

    res.json({
      success: true,
      rooms: roomsWithDetails
    });

  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching rooms'
    });
  }
});

// @route   POST /api/rooms
// @desc    Create a new room
// @access  Private
router.post('/', 
  authenticateToken,
  [
    body('roomName')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Room name must be between 1 and 100 characters'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description must not exceed 500 characters'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('tags.*')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Each tag must not exceed 50 characters')
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }

      const { roomName, description, tags } = req.body;
      const userId = req.user.id;
      const username = req.user.username;

      // Generate unique room ID
      const roomId = Math.random().toString(36).substr(2, 9);

      // Create new room
      const newRoom = new Room({
        roomId,
        roomName: roomName.trim(),
        description: description?.trim() || '',
        createdBy: userId,
        participants: [{
          userId,
          username,
          lastActive: new Date()
        }],
        tags: tags || [],
        lastActivity: new Date()
      });

      await newRoom.save();

      // Populate created room
      const populatedRoom = await Room.findById(newRoom._id)
        .populate('createdBy', 'username email');

      res.status(201).json({
        success: true,
        message: 'Room created successfully',
        room: populatedRoom
      });

    } catch (error) {
      console.error('Create room error:', error);
      
      // Handle duplicate roomId error
      if (error.code === 11000 && error.keyPattern.roomId) {
        return res.status(500).json({
          success: false,
          message: 'Failed to generate unique room ID, please try again'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Server error while creating room'
      });
    }
  }
);

// @route   GET /api/rooms/:roomId
// @desc    Get room details by roomId
// @access  Private
router.get('/:roomId',
  authenticateToken,
  [
    param('roomId')
      .isLength({ min: 5, max: 20 })
      .withMessage('Invalid room ID format')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }

      const { roomId } = req.params;
      const userId = req.user.id;

      // Find room and check if user has access
      const room = await Room.findOne({
        roomId,
        $or: [
          { createdBy: userId },
          { 'participants.userId': userId }
        ],
        isActive: true
      }).populate('createdBy', 'username email');

      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found or access denied'
        });
      }

      // Get files in this room
      const files = await File.find({ roomId }).sort({ updatedAt: -1 });

      res.json({
        success: true,
        room: {
          ...room.toObject({ virtuals: true }),
          files,
          participantCount: room.participants.length
        }
      });

    } catch (error) {
      console.error('Get room error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching room'
      });
    }
  }
);

// @route   PUT /api/rooms/:roomId/join
// @desc    Join an existing room
// @access  Private
router.put('/:roomId/join',
  authenticateToken,
  [
    param('roomId')
      .isLength({ min: 5, max: 20 })
      .withMessage('Invalid room ID format')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }

      const { roomId } = req.params;
      const userId = req.user.id;
      const username = req.user.username;

      // Find room
      const room = await Room.findOne({ roomId, isActive: true });

      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }

      // Add user as participant
      await room.addParticipant(userId, username);

      // Return updated room
      const updatedRoom = await Room.findById(room._id)
        .populate('createdBy', 'username email');

      res.json({
        success: true,
        message: 'Joined room successfully',
        room: updatedRoom
      });

    } catch (error) {
      console.error('Join room error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while joining room'
      });
    }
  }
);

// @route   PUT /api/rooms/:roomId
// @desc    Update room details
// @access  Private (only room creator)
router.put('/:roomId',
  authenticateToken,
  [
    param('roomId')
      .isLength({ min: 5, max: 20 })
      .withMessage('Invalid room ID format'),
    body('roomName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Room name must be between 1 and 100 characters'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description must not exceed 500 characters'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }

      const { roomId } = req.params;
      const userId = req.user.id;

      // Find room and check if user is creator
      const room = await Room.findOne({
        roomId,
        createdBy: userId,
        isActive: true
      });

      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found or you do not have permission to update it'
        });
      }

      // Update room fields
      const { roomName, description, tags } = req.body;

      if (roomName) room.roomName = roomName.trim();
      if (description !== undefined) room.description = description.trim();
      if (tags) room.tags = tags;

      room.lastActivity = new Date();
      await room.save();

      const updatedRoom = await Room.findById(room._id)
        .populate('createdBy', 'username email');

      res.json({
        success: true,
        message: 'Room updated successfully',
        room: updatedRoom
      });

    } catch (error) {
      console.error('Update room error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while updating room'
      });
    }
  }
);

// @route   DELETE /api/rooms/:roomId
// @desc    Delete room (soft delete)
// @access  Private (only room creator)
router.delete('/:roomId',
  authenticateToken,
  [
    param('roomId')
      .isLength({ min: 5, max: 20 })
      .withMessage('Invalid room ID format')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }

      const { roomId } = req.params;
      const userId = req.user.id;

      // Find room and check if user is creator
      const room = await Room.findOne({
        roomId,
        createdBy: userId,
        isActive: true
      });

      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found or you do not have permission to delete it'
        });
      }

      // Soft delete
      room.isActive = false;
      await room.save();

      res.json({
        success: true,
        message: 'Room deleted successfully'
      });

    } catch (error) {
      console.error('Delete room error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while deleting room'
      });
    }
  }
);

export default router;