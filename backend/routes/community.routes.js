const express = require('express');
const router = express.Router();
const {
    createPost,
    getAllPosts,
    getPostById,
    addComment,
    votePost,
    reportPost,
    getUserPosts,
    deletePost,
    getCommunityStats
} = require('../controllers/community.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');

// All routes require authentication


// Community posts routes
router.post('/posts', createPost);
router.get('/posts', getAllPosts);
router.get('/posts/stats', getCommunityStats);
router.get('/posts/user', getUserPosts);
router.get('/posts/:id', getPostById);
router.delete('/posts/:id', deletePost);

// Comments routes
router.post('/posts/:id/comments', addComment);

// Voting routes
router.post('/posts/:id/vote', votePost);

// Reporting routes
router.post('/posts/:id/report', reportPost);

module.exports = router;
