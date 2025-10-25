const Video = require('../models/video.model.js');
const User = require('../models/user.model.js');
const locationService = require('../services/locationService.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const ffmpeg = require('fluent-ffmpeg');

// Configure multer for video uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = './uploads/videos';
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/avi', 'video/quicktime', 'video/webm', 'video/x-matroska'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only video files are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB max file size
    }
});

// Helper function to get video metadata
const getVideoMetadata = (filePath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                reject(err);
            } else {
                const videoStream = metadata.streams.find(s => s.codec_type === 'video');
                resolve({
                    duration: metadata.format.duration,
                    width: videoStream?.width,
                    height: videoStream?.height,
                    format: metadata.format.format_name
                });
            }
        });
    });
};

// Helper function to generate thumbnail
const generateThumbnail = (videoPath, outputPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .screenshots({
                timestamps: ['10%'],
                filename: path.basename(outputPath),
                folder: path.dirname(outputPath),
                size: '320x240'
            })
            .on('end', () => resolve(outputPath))
            .on('error', (err) => reject(err));
    });
};

// Upload a new video
const uploadVideo = async (req, res) => {
    try {
        console.log('Upload video request received');
        console.log('User:', req.user);
        console.log('File:', req.file);
        console.log('Body:', req.body);

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No video file uploaded'
            });
        }

        // FIX: Change req.user.id to req.user._id
        const uploaderId = req.user._id;
        const { title, description, scamType, region, pincode, isAnonymous, tags } = req.body;

        // Validate required fields
        if (!title || !description || !scamType || !region || !pincode) {
            await fs.unlink(req.file.path); // Delete uploaded file
            return res.status(400).json({
                success: false,
                message: 'Title, description, scam type, region, and pincode are required'
            });
        }

        // Get coordinates from pincode
        let coordinates = { latitude: 0, longitude: 0 };
        try {
            coordinates = await locationService.getCoordinatesFromPincode(pincode);
        } catch (error) {
            console.log('Could not get coordinates for pincode:', pincode);
        }

        // Get video metadata
        let metadata = { duration: 0, width: 0, height: 0 };
        try {
            metadata = await getVideoMetadata(req.file.path);
        } catch (error) {
            console.log('Could not get video metadata:', error.message);
        }

        // Generate thumbnail
        const thumbnailDir = './uploads/thumbnails';
        await fs.mkdir(thumbnailDir, { recursive: true });
        const thumbnailPath = path.join(thumbnailDir, `thumb-${Date.now()}.jpg`);
        
        let finalThumbnailPath = thumbnailPath;
        try {
            await generateThumbnail(req.file.path, thumbnailPath);
        } catch (error) {
            console.log('Could not generate thumbnail:', error.message);
            finalThumbnailPath = null;
        }

        // Create video document
        const video = new Video({
            title,
            description,
            uploader: uploaderId,
            videoUrl: req.file.path,
            thumbnailUrl: finalThumbnailPath,
            duration: Math.round(metadata.duration || 0),
            fileSize: req.file.size,
            resolution: {
                width: metadata.width || 0,
                height: metadata.height || 0
            },
            format: path.extname(req.file.originalname).substring(1).toLowerCase(),
            scamType,
            region,
            pincode,
            coordinates,
            isAnonymous: isAnonymous === 'true' || isAnonymous === true,
            tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim())) : [],
            status: 'active',
            processingStatus: 'completed'
        });

        await video.save();
        await video.populate('uploader', 'name email');

        res.status(201).json({
            success: true,
            message: 'Video uploaded successfully',
            data: video
        });
    } catch (error) {
        console.error('Error uploading video:', error);
        
        // Clean up uploaded file on error
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Failed to upload video',
            error: error.message
        });
    }
};

// Get all videos with pagination and filtering
const getAllVideos = async (req, res) => {
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
            sort.isPinned = -1; // Pinned videos first
        }

        const videos = await Video.find(filter)
            .populate('uploader', 'name email')
            .populate('comments.author', 'name email')
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const totalVideos = await Video.countDocuments(filter);
        const totalPages = Math.ceil(totalVideos / limit);

        res.json({
            success: true,
            data: {
                videos,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalVideos,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch videos',
            error: error.message
        });
    }
};

// Get a single video by ID
const getVideoById = async (req, res) => {
    try {
        const { id } = req.params;

        const video = await Video.findById(id)
            .populate('uploader', 'name email')
            .populate('comments.author', 'name email');

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Increment view count
        video.views += 1;
        await video.save();

        res.json({
            success: true,
            data: video
        });
    } catch (error) {
        console.error('Error fetching video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch video',
            error: error.message
        });
    }
};

// Stream video
const streamVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const video = await Video.findById(id);

        if (!video || video.status !== 'active') {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        const videoPath = video.videoUrl;
        const stat = await fs.stat(videoPath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            
            const readStream = require('fs').createReadStream(videoPath, { start, end });
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
            };

            res.writeHead(206, head);
            readStream.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            };
            res.writeHead(200, head);
            require('fs').createReadStream(videoPath).pipe(res);
        }
    } catch (error) {
        console.error('Error streaming video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to stream video',
            error: error.message
        });
    }
};

// Add a comment to a video
const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, isAnonymous } = req.body;
        // FIX: Change req.user.id to req.user._id
        const author = req.user._id;

        if (!content) {
            return res.status(400).json({
                success: false,
                message: 'Comment content is required'
            });
        }

        const video = await Video.findById(id);
        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        const comment = {
            author,
            content,
            isAnonymous: isAnonymous || false
        };

        video.comments.push(comment);
        await video.save();
        await video.populate('comments.author', 'name email');

        res.json({
            success: true,
            message: 'Comment added successfully',
            data: video.comments[video.comments.length - 1]
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

// Vote on a video (upvote/downvote)
const voteVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const { voteType } = req.body;
        // FIX: Change req.user.id to req.user._id
        const userId = req.user._id;

        if (!['upvote', 'downvote'].includes(voteType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid vote type'
            });
        }

        const video = await Video.findById(id);
        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        const existingVote = video.votes.voters.find(voter => voter.user.toString() === userId.toString());
        
        if (existingVote) {
            if (existingVote.voteType === voteType) {
                video.votes.voters = video.votes.voters.filter(voter => voter.user.toString() !== userId.toString());
                if (voteType === 'upvote') {
                    video.votes.upvotes -= 1;
                } else {
                    video.votes.downvotes -= 1;
                }
            } else {
                existingVote.voteType = voteType;
                if (voteType === 'upvote') {
                    video.votes.upvotes += 1;
                    video.votes.downvotes -= 1;
                } else {
                    video.votes.downvotes += 1;
                    video.votes.upvotes -= 1;
                }
            }
        } else {
            video.votes.voters.push({ user: userId, voteType });
            if (voteType === 'upvote') {
                video.votes.upvotes += 1;
            } else {
                video.votes.downvotes += 1;
            }
        }

        await video.save();

        res.json({
            success: true,
            message: 'Vote recorded successfully',
            data: {
                upvotes: video.votes.upvotes,
                downvotes: video.votes.downvotes
            }
        });
    } catch (error) {
        console.error('Error voting on video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to vote on video',
            error: error.message
        });
    }
};

// Report a video
const reportVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        // FIX: Change req.user.id to req.user._id
        const userId = req.user._id;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Report reason is required'
            });
        }

        const video = await Video.findById(id);
        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        const existingReport = video.reportedBy.find(report => report.user.toString() === userId.toString());
        if (existingReport) {
            return res.status(400).json({
                success: false,
                message: 'You have already reported this video'
            });
        }

        video.reportedBy.push({
            user: userId,
            reason
        });

        await video.save();

        res.json({
            success: true,
            message: 'Video reported successfully'
        });
    } catch (error) {
        console.error('Error reporting video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to report video',
            error: error.message
        });
    }
};

// Get user's videos
const getUserVideos = async (req, res) => {
    try {
        // FIX: Change req.user.id to req.user._id
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const videos = await Video.find({ uploader: userId })
            .populate('uploader', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalVideos = await Video.countDocuments({ uploader: userId });
        const totalPages = Math.ceil(totalVideos / limit);

        res.json({
            success: true,
            data: {
                videos,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalVideos,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Error fetching user videos:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user videos',
            error: error.message
        });
    }
};

// Delete a video (only by uploader or admin)
const deleteVideo = async (req, res) => {
    try {
        const { id } = req.params;
        // FIX: Change req.user.id to req.user._id
        const userId = req.user._id;
        const userRole = req.user.role;

        const video = await Video.findById(id);
        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        if (video.uploader.toString() !== userId.toString() && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this video'
            });
        }

        video.status = 'deleted';
        await video.save();

        res.json({
            success: true,
            message: 'Video deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete video',
            error: error.message
        });
    }
};

// Get video statistics
const getVideoStats = async (req, res) => {
    try {
        const totalVideos = await Video.countDocuments({ status: 'active' });
        const totalViews = await Video.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: null, total: { $sum: '$views' } } }
        ]);

        const scamTypeStats = await Video.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: '$scamType', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const regionStats = await Video.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: '$region', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        const totalDuration = await Video.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: null, total: { $sum: '$duration' } } }
        ]);

        res.json({
            success: true,
            data: {
                totalVideos,
                totalViews: totalViews[0]?.total || 0,
                totalDuration: totalDuration[0]?.total || 0,
                scamTypeStats,
                regionStats
            }
        });
    } catch (error) {
        console.error('Error fetching video stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch video statistics',
            error: error.message
        });
    }
};

module.exports = {
    upload,
    uploadVideo,
    getAllVideos,
    getVideoById,
    streamVideo,
    addComment,
    voteVideo,
    reportVideo,
    getUserVideos,
    deleteVideo,
    getVideoStats
};
