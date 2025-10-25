const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    location: {
        type: String,
        required: true,
    },
    pincode: {
        type: String,
        required: true,
        trim: true,
    },
    coordinates: {
        latitude: {
            type: Number,
        },
        longitude: {
            type: Number,
        },
    },
    scammerDetails: {
        name: {
            type: String,
            trim: true
        },
        phoneNumber: {
            type: String,
            trim: true
        },
        upiId: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true
        },
        website: {
            type: String,
            trim: true
        },
        scamType: {
            type: String,
            enum: ['phishing', 'investment', 'romance', 'tech-support', 'fake-calls', 'social-media', 'upi-fraud', 'banking', 'other']
        },
        description: {
            type: String,
            trim: true
        },
        socialMediaHandles: [{
            platform: {
                type: String,
                enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'telegram', 'whatsapp', 'other']
            },
            handle: {
                type: String,
                trim: true
            }
        }],
        evidence: [{
            type: {
                type: String,
                enum: ['screenshot', 'call-recording', 'message', 'document', 'other']
            },
            url: {
                type: String
            },
            description: {
                type: String,
                trim: true
            }
        }]
    },
    scammerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Scammer'
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    report: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Report',
    },
    image : {
        type : String,
        require : true,
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'high',
    },
    status: {
        type: String,
        enum: ['reported', 'under review', 'resolved', 'dismissed'],
        default: 'reported',
    },
    message: [
        {
            text: {
                type: String,
                required: true,
            },
            date: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    feedback: {
        text: {
            type: String,
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
        submittedAt: {
            type: Date,
        },
        submittedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
}, { timestamps: true }); // Automatically manage createdAt and updatedAt

module.exports = mongoose.model('Incident', incidentSchema);
