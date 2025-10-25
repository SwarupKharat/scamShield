const protectRoute = require('../middleware/auth.middleware.js');
const authorityProtect = require('../middleware/authority.middleware.js')
const express = require('express');
const {viewIncidents, updateIncident, markIncidentAsSolved, getUser, assignIncident, updateIncidentStatus, getAssignedIncidents, getAuthorityDashboard, getFeedback} = require('../controllers/authority.controllers.js')
const router = express.Router();

// View incidents
router.get('/view-incidents', protectRoute, authorityProtect, viewIncidents);
router.get('/assigned-incidents', protectRoute, authorityProtect, getAssignedIncidents);

// Incident management
router.put('/update-incident/:id', protectRoute, authorityProtect, updateIncident);
router.put('/mark-solved/:id', protectRoute, authorityProtect, markIncidentAsSolved);
router.post('/assign-incident', protectRoute, authorityProtect, assignIncident);
router.put('/update-status', protectRoute, authorityProtect, updateIncidentStatus);

// Dashboard
router.get('/dashboard', protectRoute, authorityProtect, getAuthorityDashboard);

// User management
router.get('/user/:id', protectRoute, authorityProtect, getUser);

// Feedback
router.get('/feedback', protectRoute, authorityProtect, getFeedback);

module.exports = router;