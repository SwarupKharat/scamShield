const express = require('express');
const router = express.Router();
const scammerController = require('../controllers/scammer.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');
const adminMiddleware = require('../middleware/admin.middleware.js');

// Public routes (require authentication)


// Get all scammers with filtering and pagination
router.get('/', scammerController.getAllScammers);

// Search scammers
router.get('/search', scammerController.searchScammers);

// Get top scammers (most reported)
router.get('/top', scammerController.getTopScammers);

// Get scammer statistics
router.get('/statistics', scammerController.getScammerStatistics);

// Get scammer by ID
router.get('/:id', scammerController.getScammerById);

// Create new scammer entry
router.post('/', scammerController.createScammer);

// Admin only routes
router.use(adminMiddleware);

// Update scammer verification status
router.put('/:id/verification', scammerController.updateScammerVerification);

// Add admin note to scammer
router.post('/:id/notes', scammerController.addAdminNote);

// Delete scammer (soft delete)
router.delete('/:id', scammerController.deleteScammer);

module.exports = router;
