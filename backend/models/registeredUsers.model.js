const mongoose = require('mongoose');

const registeredUserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    mobile: {
        type: String, // Kept as String to accommodate country codes if needed
        required: true,
        unique: true,
    },
    aadharCard: {
        type: String,
        required: true,
        unique: true,
    },
    photo: {
        type: String,
        required: true,
        unique: true,
    },
    address: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'], // Track the verification status
        default: 'pending',
    }, 
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Export the model
module.exports = mongoose.model('RegisteredUser', registeredUserSchema);
