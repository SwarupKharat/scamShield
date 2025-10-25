const express = require('express');
const router = express.Router();
const videoController = require('../controllers/video.controller.js');
const { protectRoute } = require('../middleware/auth.middleware.js');

// Upload video (requires authentication)
router.post('/upload', 
    protectRoute, 
    videoController.upload.single('video'), 
    videoController.uploadVideo
);

// Get all videos (public with optional auth for personalization)
router.get('/', protectRoute, videoController.getAllVideos);

// Get video statistics
router.get('/stats', videoController.getVideoStats);

// Get user's videos
router.get('/my-videos', protectRoute, videoController.getUserVideos);

// Get single video by ID
router.get('/:id', protectRoute, videoController.getVideoById);

// Stream video
router.get('/:id/stream', videoController.streamVideo);

// Add comment to video
router.post('/:id/comments', protectRoute, videoController.addComment);

// Vote on video
router.post('/:id/vote', protectRoute, videoController.voteVideo);

// Report video
router.post('/:id/report', protectRoute, videoController.reportVideo);

// Delete video
router.delete('/:id', protectRoute, videoController.deleteVideo);

module.exports = router;
