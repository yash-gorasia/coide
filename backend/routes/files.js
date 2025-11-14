import express from 'express';
import { body, validationResult } from 'express-validator';
import File from '../models/File.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all files in a room
router.get('/room/:roomId', authenticateToken, async (req, res) => {
    try {
        const { roomId } = req.params;
        
        const files = await File.find({ 
            roomId, 
            isActive: true 
        })
        .populate('createdBy', 'username')
        .populate('lastModifiedBy', 'username')
        .sort({ createdAt: 1 });

        res.json({
            success: true,
            files
        });
    } catch (error) {
        console.error('Get files error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching files'
        });
    }
});

// Get a specific file
router.get('/:fileId', authenticateToken, async (req, res) => {
    try {
        const { fileId } = req.params;
        
        const file = await File.findById(fileId)
            .populate('createdBy', 'username')
            .populate('lastModifiedBy', 'username');

        if (!file || !file.isActive) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        res.json({
            success: true,
            file
        });
    } catch (error) {
        console.error('Get file error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching file'
        });
    }
});

// Create a new file
router.post('/', [
    authenticateToken,
    body('fileName')
        .notEmpty()
        .withMessage('File name is required')
        .isLength({ max: 100 })
        .withMessage('File name too long'),
    body('roomId')
        .notEmpty()
        .withMessage('Room ID is required'),
    body('content')
        .optional()
        .isLength({ max: 1000000 })
        .withMessage('File content too large'),
    body('language')
        .optional()
        .trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { fileName, content = '', language = 'javascript', roomId } = req.body;

        // Check if file already exists in the room
        const existingFile = await File.findOne({ 
            roomId, 
            fileName, 
            isActive: true 
        });

        if (existingFile) {
            return res.status(400).json({
                success: false,
                message: 'File with this name already exists in the room'
            });
        }

        const file = new File({
            fileName,
            content,
            language,
            roomId,
            createdBy: req.user._id,
            lastModifiedBy: req.user._id
        });

        await file.save();
        
        // Populate user data before sending response
        await file.populate('createdBy', 'username');
        await file.populate('lastModifiedBy', 'username');

        res.status(201).json({
            success: true,
            message: 'File created successfully',
            file
        });
    } catch (error) {
        console.error('Create file error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating file'
        });
    }
});

// Update file content
router.put('/:fileId', [
    authenticateToken,
    body('content')
        .optional()
        .isLength({ max: 1000000 })
        .withMessage('File content too large'),
    body('language')
        .optional()
        .trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { fileId } = req.params;
        const { content, language } = req.body;

        const file = await File.findById(fileId);

        if (!file || !file.isActive) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        // Update fields if provided
        if (content !== undefined) file.content = content;
        if (language !== undefined) file.language = language;
        file.lastModifiedBy = req.user._id;

        await file.save();
        
        // Populate user data before sending response
        await file.populate('createdBy', 'username');
        await file.populate('lastModifiedBy', 'username');

        res.json({
            success: true,
            message: 'File updated successfully',
            file
        });
    } catch (error) {
        console.error('Update file error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating file'
        });
    }
});

// Rename file
router.patch('/:fileId/rename', [
    authenticateToken,
    body('fileName')
        .notEmpty()
        .withMessage('File name is required')
        .isLength({ max: 100 })
        .withMessage('File name too long')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { fileId } = req.params;
        const { fileName } = req.body;

        const file = await File.findById(fileId);

        if (!file || !file.isActive) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        // Check if new name conflicts with existing file in room
        const existingFile = await File.findOne({
            _id: { $ne: fileId },
            roomId: file.roomId,
            fileName,
            isActive: true
        });

        if (existingFile) {
            return res.status(400).json({
                success: false,
                message: 'File with this name already exists in the room'
            });
        }

        file.fileName = fileName;
        file.lastModifiedBy = req.user._id;
        await file.save();

        // Populate user data before sending response
        await file.populate('createdBy', 'username');
        await file.populate('lastModifiedBy', 'username');

        res.json({
            success: true,
            message: 'File renamed successfully',
            file
        });
    } catch (error) {
        console.error('Rename file error:', error);
        res.status(500).json({
            success: false,
            message: 'Error renaming file'
        });
    }
});

// Delete file (soft delete)
router.delete('/:fileId', authenticateToken, async (req, res) => {
    try {
        const { fileId } = req.params;

        const file = await File.findById(fileId);

        if (!file || !file.isActive) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        // Soft delete
        file.isActive = false;
        file.lastModifiedBy = req.user._id;
        await file.save();

        res.json({
            success: true,
            message: 'File deleted successfully'
        });
    } catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting file'
        });
    }
});

export default router;