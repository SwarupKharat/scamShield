const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
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
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User who reported the incident
        required: true,
    },
    status: {
        type: String,
        enum: ['open', 'in-progress', 'resolved', 'closed'], // Incident lifecycle statuses
        default: 'open',
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'], // Incident severity levels
        required: true,
    },
    location: {
        type: String, // Can be a textual description or coordinates
        required: true,
    },
    attachments: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User assigned to handle the incident
    },
    
});

module.exports = mongoose.model('Report', reportSchema);
