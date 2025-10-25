const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: "user",
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    mobile: {
        type: String, 
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    aadharCard: {
        type: String,
        required: true,
        unique: true,
    },
    
    role: {
        type: String,
        enum: ['admin', 'authority', 'user'], 
        default: "user",
    },
    profilePic: {
        type: String,
        required: false,
        default: null,
    },
    reportedEvents: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Report', 
        },
    ],
    notifications: [
        {
            text: {
                type: String,
            },
            incidentId : {
                type : mongoose.Schema.Types.ObjectId,
                ref : 'Incident',
            }
        },
    ],    
});

module.exports = mongoose.model('User', userSchema);
