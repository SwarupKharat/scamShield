const express = require('express');
const router = express.Router();
const {
    sendHelplineMessage,
    getHelplineStats,
    sendBulkAlert,
    verifyScamReport,
    getHelplineTemplates
} = require('../controllers/helpline.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');
const adminMiddleware = require('../middleware/admin.middleware.js');

// Public helpline routes (no auth required for basic helpline access)
router.post('/send-message', sendHelplineMessage);
router.get('/stats', getHelplineStats);
router.get('/templates', getHelplineTemplates);

// Admin-only routes
router.post('/bulk-alert', authMiddleware, adminMiddleware, sendBulkAlert);
router.post('/verify-scam', authMiddleware, verifyScamReport);

module.exports = router;
