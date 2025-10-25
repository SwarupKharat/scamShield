const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
        enum: ['active', 'hidden', 'deleted'],
        default: 'active'
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
    }]
}, { 
    timestamps: true 
});

// Index for better query performance
communityPostSchema.index({ scamType: 1, region: 1, createdAt: -1 });
communityPostSchema.index({ author: 1 });
communityPostSchema.index({ status: 1, isPinned: -1, createdAt: -1 });

module.exports = mongoose.model('CommunityPost', communityPostSchema);
