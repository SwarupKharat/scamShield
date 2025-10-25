const protectRoute = require('../middleware/auth.middleware.js');
const express = require('express');
const router = express.Router();
const {login, signup, reportIncident, viewReport, viewIncident, updateProfile, checkApproval, adminSignUp, getNotifications, logout, authoritySignUp, changePassword, getUserIncidents, markNotificationAsRead, clearAllNotifications, getCurrentUser, submitFeedback} = require('../controllers/auth.controller.js');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // or another folder where you wish to store files
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
  });
const upload = multer({ storage });

// Test endpoint for network connectivity
router.get('/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Backend server is running!',
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: '/api/auth',
            community: '/api/community',
            map: '/api/map',
            helpline: '/api/helpline',
            scammers: '/api/scammers'
        }
    });
});

// Debug endpoint (remove in production)
router.get('/debug/users', async (req, res) => {
    try {
        const User = require('../models/user.model.js');
        const RegisteredUser = require('../models/registeredUsers.model.js');
        
        const users = await User.find({}).select('email role createdAt');
        const registeredUsers = await RegisteredUser.find({}).select('email status createdAt');
        
        res.json({
            users: users,
            registeredUsers: registeredUsers,
            userCount: users.length,
            registeredUserCount: registeredUsers.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Authentication routes
router.post('/login', login);
router.post('/signup', upload.fields([
    { name: 'aadharCard', maxCount: 1 },
    { name: 'photo', maxCount: 1 }
]), signup);
router.post('/admin-signup', adminSignUp);
router.post('/authority-signup', authoritySignUp);
router.post('/logout', logout);

// Session verification
router.get('/me', protectRoute, getCurrentUser);

// User functionality
router.post('/check-approval', checkApproval);
router.post('/report-incident', protectRoute, upload.single('image'), reportIncident);
router.get('/notifications', protectRoute, getNotifications);
router.post('/mark-notification-read', protectRoute, markNotificationAsRead);
router.delete('/clear-notifications', protectRoute, clearAllNotifications);
router.get('/user-incidents', protectRoute, getUserIncidents);
router.put('/update-profile', protectRoute, updateProfile);
router.put('/change-password', protectRoute, changePassword);

// Incident and report viewing
router.get('/view-incident/:id', protectRoute, viewIncident);
router.get('/view-report/:id', protectRoute, viewReport);

// Feedback
router.post('/submit-feedback', protectRoute, submitFeedback);

module.exports = router;