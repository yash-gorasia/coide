import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    content: {
        type: String,
        default: '',
        maxlength: 1000000 // 1MB limit for code content
    },
    language: {
        type: String,
        default: 'javascript',
        trim: true
    },
    roomId: {
        type: String,
        required: true,
        index: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for efficient queries
fileSchema.index({ roomId: 1, fileName: 1 }, { unique: true });

// Update the updatedAt field before saving
fileSchema.pre('save', function(next) {
    if (this.isModified() && !this.isNew) {
        this.updatedAt = new Date();
    }
    next();
});

export default mongoose.model('File', fileSchema);