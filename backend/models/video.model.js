const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    videoUrl: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String
    },
    duration: {
        type: Number, // in seconds
        default: 0
    },
    fileSize: {
        type: Number, // in bytes
        required: true
    },
    resolution: {
        width: Number,
        height: Number
    },
    format: {
        type: String,
        enum: ['mp4', 'avi', 'mov', 'webm', 'mkv'],
        required: true
    },
    scamType: {
        type: String,
        enum: ['phishing', 'investment', 'romance', 'tech-support', 'fake-calls', 'social-media', 'other'],
        required: true
    },
    region: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true,
        trim: true
    },
    coordinates: {
        latitude: {
            type: Number,
        },
        longitude: {
            type: Number,
        },
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String,
        trim: true
    }],
    votes: {
        upvotes: {
            type: Number,
            default: 0
        },
        downvotes: {
            type: Number,
            default: 0
        },
        voters: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            voteType: {
                type: String,
                enum: ['upvote', 'downvote']
            }
        }]
    },
    comments: [{
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500
        },
        isAnonymous: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['processing', 'active', 'hidden', 'deleted', 'failed'],
        default: 'processing'
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    },
    reportedBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reason: {
            type: String,
            enum: ['spam', 'inappropriate', 'misleading', 'other']
        },
        reportedAt: {
            type: Date,
            default: Date.now
        }
    }],
    processingStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    }
}, { 
    timestamps: true 
});

// Indexes for better query performance
videoSchema.index({ scamType: 1, region: 1, createdAt: -1 });
videoSchema.index({ uploader: 1 });
videoSchema.index({ status: 1, isPinned: -1, createdAt: -1 });
videoSchema.index({ tags: 1 });

module.exports = mongoose.model('Video', videoSchema);
