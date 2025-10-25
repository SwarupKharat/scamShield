const express = require('express');
const router = express.Router();
const {
    getIncidentMapData,
    getCommunityMapData,
    getCombinedMapData,
    getScamHotspots
} = require('../controllers/map.controller.js');

// Map data routes
router.get('/incidents', getIncidentMapData);
router.get('/community', getCommunityMapData);
router.get('/combined', getCombinedMapData);
router.get('/hotspots', getScamHotspots);

module.exports = router;
