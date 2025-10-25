const CommunityPost = require('../models/communityPost.model.js');
const User = require('../models/user.model.js');
const locationService = require('../services/locationService.js');

// Create a new community post
const createPost = async (req, res) => {
    try {
        const { title, content, scamType, region, isAnonymous, tags, pincode } = req.body;
        
        const authorId = req.user ? req.user.id : "68efa7b98d954a91f55c71ab";

        // Validate required fields
        if (!title || !content || !scamType || !region || !pincode) {
            return res.status(400).json({
                success: false,
                message: 'Title, content, scam type, region, and pincode are required'
            });
        }

        // Get coordinates from pincode
        const coordinates = await locationService.getCoordinatesFromPincode(pincode);

        const post = new CommunityPost({
            title,
            content,
            author: authorId,
            scamType,
            region,
            pincode,
            coordinates,
            isAnonymous: isAnonymous || false,
            tags: tags || []
        });

        await post.save();
        await post.populate('author', 'name email');

        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            data: post
        });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create post',
            error: error.message
        });
    }
};

// Get all community posts with pagination and filtering
const getAllPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const { scamType, region, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        
        // Build filter object
        const filter = { status: 'active' };
        if (scamType) filter.scamType = scamType;
        if (region) filter.region = region;

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        if (sortBy === 'createdAt') {
            sort.isPinned = -1; // Pinned posts first
        }

        const posts = await CommunityPost.find(filter)
            .populate('author', 'name email')
            .populate('comments.author', 'name email')
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const totalPosts = await CommunityPost.countDocuments(filter);
        const totalPages = Math.ceil(totalPosts / limit);

        res.json({
            success: true,
            data: {
                posts,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalPosts,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch posts',
            error: error.message
        });
    }
};

// Get a single post by ID
const getPostById = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await CommunityPost.findById(id)
            .populate('author', 'name email')
            .populate('comments.author', 'name email');

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Increment view count
        post.views += 1;
        await post.save();

        res.json({
            success: true,
            data: post
        });
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch post',
            error: error.message
        });
    }
};

// Add a comment to a post
const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, isAnonymous } = req.body;
        const author = req.user ? req.user.id : "68efa7b98d954a91f55c71ab";

        if (!content) {
            return res.status(400).json({
                success: false,
                message: 'Comment content is required'
            });
        }

        const post = await CommunityPost.findById(id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        const comment = {
            author,
            content,
            isAnonymous: isAnonymous || false
        };

        post.comments.push(comment);
        await post.save();
        await post.populate('comments.author', 'name email');

        res.json({
            success: true,
            message: 'Comment added successfully',
            data: post.comments[post.comments.length - 1]
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add comment',
            error: error.message
        });
    }
};

// Vote on a post (upvote/downvote)
const votePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { voteType } = req.body; // 'upvote' or 'downvote'
        const userId = req.user ? req.user.id : "68efa7b98d954a91f55c71ab";


        if (!['upvote', 'downvote'].includes(voteType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid vote type'
            });
        }

        const post = await CommunityPost.findById(id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Check if user already voted
        const existingVote = post.votes.voters.find(voter => voter.user.toString() === userId);
        
        if (existingVote) {
            // If same vote type, remove vote
            if (existingVote.voteType === voteType) {
                post.votes.voters = post.votes.voters.filter(voter => voter.user.toString() !== userId);
                if (voteType === 'upvote') {
                    post.votes.upvotes -= 1;
                } else {
                    post.votes.downvotes -= 1;
                }
            } else {
                // Change vote type
                existingVote.voteType = voteType;
                if (voteType === 'upvote') {
                    post.votes.upvotes += 1;
                    post.votes.downvotes -= 1;
                } else {
                    post.votes.downvotes += 1;
                    post.votes.upvotes -= 1;
                }
            }
        } else {
            // Add new vote
            post.votes.voters.push({ user: userId, voteType });
            if (voteType === 'upvote') {
                post.votes.upvotes += 1;
            } else {
                post.votes.downvotes += 1;
            }
        }

        await post.save();

        res.json({
            success: true,
            message: 'Vote recorded successfully',
            data: {
                upvotes: post.votes.upvotes,
                downvotes: post.votes.downvotes
            }
        });
    } catch (error) {
        console.error('Error voting on post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to vote on post',
            error: error.message
        });
    }
};

// Report a post
const reportPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const userId = req.user ? req.user.id : "68efa7b98d954a91f55c71ab";

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Report reason is required'
            });
        }

        const post = await CommunityPost.findById(id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Check if user already reported this post
        const existingReport = post.reportedBy.find(report => report.user.toString() === userId);
        if (existingReport) {
            return res.status(400).json({
                success: false,
                message: 'You have already reported this post'
            });
        }

        post.reportedBy.push({
            user: userId,
            reason
        });

        await post.save();

        res.json({
            success: true,
            message: 'Post reported successfully'
        });
    } catch (error) {
        console.error('Error reporting post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to report post',
            error: error.message
        });
    }
};

// Get user's posts
const getUserPosts = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : "68efa7b98d954a91f55c71ab";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await CommunityPost.find({ author: userId })
            .populate('author', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPosts = await CommunityPost.countDocuments({ author: userId });
        const totalPages = Math.ceil(totalPosts / limit);

        res.json({
            success: true,
            data: {
                posts,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalPosts,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user posts',
            error: error.message
        });
    }
};

// Delete a post (only by author or admin)
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user ? req.user.id : "68efa7b98d954a91f55c71ab";
        const userRole = req.user.role;

        const post = await CommunityPost.findById(id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Check if user is author or admin
        if (post.author.toString() !== userId && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this post'
            });
        }

        post.status = 'deleted';
        await post.save();

        res.json({
            success: true,
            message: 'Post deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete post',
            error: error.message
        });
    }
};

// Get community statistics
const getCommunityStats = async (req, res) => {
    try {
        const totalPosts = await CommunityPost.countDocuments({ status: 'active' });
        const totalComments = await CommunityPost.aggregate([
            { $match: { status: 'active' } },
            { $project: { commentsCount: { $size: '$comments' } } },
            { $group: { _id: null, total: { $sum: '$commentsCount' } } }
        ]);

        const scamTypeStats = await CommunityPost.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: '$scamType', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const regionStats = await CommunityPost.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: '$region', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            success: true,
            data: {
                totalPosts,
                totalComments: totalComments[0]?.total || 0,
                scamTypeStats,
                regionStats
            }
        });
    } catch (error) {
        console.error('Error fetching community stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch community statistics',
            error: error.message
        });
    }
};

module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    addComment,
    votePost,
    reportPost,
    getUserPosts,
    deletePost,
    getCommunityStats
};
