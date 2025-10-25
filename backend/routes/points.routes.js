const express = require('express');
const router = express.Router();
const protectRoute = require('../middleware/auth.middleware.js');
const adminProtect = require('../middleware/admin.middleware.js');
const {
  getUserPoints,
  getLeaderboard,
  awardVideoPoints,
  awardIncidentPoints,
  awardCommunityPoints,
  markIncidentFake,
  markContentInappropriate,
  approveIncidentGenuine,
  getPointsStats,
  getUserPointsHistory
} = require('../controllers/points.controller.js');

// User routes
router.get('/user-points', protectRoute, getUserPoints);
router.get('/leaderboard', getLeaderboard);
router.get('/user-history', protectRoute, getUserPointsHistory);

// Admin routes
router.post('/award-video', protectRoute, adminProtect, awardVideoPoints);
router.post('/award-incident', protectRoute, adminProtect, awardIncidentPoints);
router.post('/award-community', protectRoute, adminProtect, awardCommunityPoints);
router.post('/mark-fake/:incidentId', protectRoute, adminProtect, markIncidentFake);
router.post('/mark-inappropriate/:contentType/:contentId', protectRoute, adminProtect, markContentInappropriate);
router.post('/approve-genuine/:incidentId', protectRoute, adminProtect, approveIncidentGenuine);
router.get('/stats', protectRoute, adminProtect, getPointsStats);

module.exports = router;
