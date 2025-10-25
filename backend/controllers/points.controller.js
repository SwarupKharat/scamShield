const { UserPoints, PointsTransaction } = require('../models/points.model');
const User = require('../models/user.model');
const Incident = require('../models/incident.model');
const CommunityPost = require('../models/communityPost.model');

// Get user's points and rank
exports.getUserPoints = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let userPoints = await UserPoints.findOne({ userId })
      .populate('userId', 'firstName lastName email');
    
    if (!userPoints) {
      userPoints = new UserPoints({ userId, totalPoints: 0 });
      await userPoints.save();
    }

    const rank = await userPoints.getRank();
    const pointsHistory = await userPoints.getPointsHistory(20);

    return res.status(200).json({
      success: true,
      data: {
        userPoints,
        rank,
        pointsHistory
      }
    });
  } catch (error) {
    console.error('Error getting user points:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { limit = 100, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const leaderboard = await UserPoints.find()
      .populate('userId', 'firstName lastName email')
      .sort({ totalPoints: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalUsers = await UserPoints.countDocuments();

    return res.status(200).json({
      success: true,
      data: {
        leaderboard,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers,
          hasNext: skip + leaderboard.length < totalUsers,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Award points for video upload
exports.awardVideoPoints = async (req, res) => {
  try {
    const { userId, videoId, points = 50 } = req.body;
    
    const transaction = await UserPoints.awardPoints(
      userId,
      points,
      'Video upload',
      'video_upload',
      videoId,
      'Video'
    );

    return res.status(200).json({
      success: true,
      message: `Awarded ${points} points for video upload`,
      data: transaction
    });
  } catch (error) {
    console.error('Error awarding video points:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Award points for incident report
exports.awardIncidentPoints = async (req, res) => {
  try {
    const { userId, incidentId, points = 25 } = req.body;
    
    const transaction = await UserPoints.awardPoints(
      userId,
      points,
      'Incident report',
      'incident_report',
      incidentId,
      'Incident'
    );

    return res.status(200).json({
      success: true,
      message: `Awarded ${points} points for incident report`,
      data: transaction
    });
  } catch (error) {
    console.error('Error awarding incident points:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Award points for community post
exports.awardCommunityPoints = async (req, res) => {
  try {
    const { userId, postId, points = 15 } = req.body;
    
    const transaction = await UserPoints.awardPoints(
      userId,
      points,
      'Community post',
      'community_post',
      postId,
      'CommunityPost'
    );

    return res.status(200).json({
      success: true,
      message: `Awarded ${points} points for community post`,
      data: transaction
    });
  } catch (error) {
    console.error('Error awarding community points:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Mark incident as fake and deduct points
exports.markIncidentFake = async (req, res) => {
  try {
    const { incidentId } = req.params;
    const { reason, pointsToDeduct = 100 } = req.body;
    const adminId = req.user.id;

    // Update incident status
    const incident = await Incident.findByIdAndUpdate(
      incidentId,
      { 
        status: 'fake',
        adminNotes: reason,
        reviewedBy: adminId,
        reviewedAt: new Date()
      },
      { new: true }
    );

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    // Deduct points from user
    const transaction = await UserPoints.deductPoints(
      incident.reportedBy,
      pointsToDeduct,
      'Fake incident report',
      'fake_incident',
      incidentId,
      'Incident',
      adminId
    );

    return res.status(200).json({
      success: true,
      message: `Marked incident as fake and deducted ${pointsToDeduct} points`,
      data: {
        incident,
        transaction
      }
    });
  } catch (error) {
    console.error('Error marking incident as fake:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Mark content as inappropriate and deduct points
exports.markContentInappropriate = async (req, res) => {
  try {
    const { contentId, contentType } = req.params;
    const { reason, pointsToDeduct = 50 } = req.body;
    const adminId = req.user.id;

    let content;
    let userId;

    if (contentType === 'post') {
      content = await CommunityPost.findByIdAndUpdate(
        contentId,
        { 
          status: 'inappropriate',
          adminNotes: reason,
          reviewedBy: adminId,
          reviewedAt: new Date()
        },
        { new: true }
      );
      userId = content.userId;
    } else if (contentType === 'video') {
      // Handle video content (implement based on your video model)
      content = { _id: contentId, type: 'video' };
      userId = req.body.userId; // You'll need to pass this
    }

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Deduct points from user
    const transaction = await UserPoints.deductPoints(
      userId,
      pointsToDeduct,
      'Inappropriate content',
      'inappropriate_content',
      contentId,
      contentType === 'post' ? 'CommunityPost' : 'Video',
      adminId
    );

    return res.status(200).json({
      success: true,
      message: `Marked content as inappropriate and deducted ${pointsToDeduct} points`,
      data: {
        content,
        transaction
      }
    });
  } catch (error) {
    console.error('Error marking content as inappropriate:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Approve incident as genuine and forward to cyber cell
exports.approveIncidentGenuine = async (req, res) => {
  try {
    const { incidentId } = req.params;
    const { cyberCellNotes, pointsToAward = 200 } = req.body;
    const adminId = req.user.id;

    // Update incident status and forward to cyber cell
    const incident = await Incident.findByIdAndUpdate(
      incidentId,
      { 
        status: 'forwarded_to_cyber_cell',
        adminNotes: cyberCellNotes,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        forwardedToCyberCell: true,
        forwardedAt: new Date()
      },
      { new: true }
    );

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    // Award bonus points for genuine incident
    const transaction = await UserPoints.awardPoints(
      incident.reportedBy,
      pointsToAward,
      'Genuine incident approved',
      'genuine_incident',
      incidentId,
      'Incident',
      adminId
    );

    // TODO: Implement actual cyber cell notification/API integration
    // This could be an email, SMS, or API call to cyber cell system

    return res.status(200).json({
      success: true,
      message: `Incident approved as genuine and forwarded to cyber cell. Awarded ${pointsToAward} bonus points`,
      data: {
        incident,
        transaction
      }
    });
  } catch (error) {
    console.error('Error approving incident as genuine:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get points statistics
exports.getPointsStats = async (req, res) => {
  try {
    const totalUsers = await UserPoints.countDocuments();
    const totalPoints = await UserPoints.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPoints' } } }
    ]);

    const levelDistribution = await UserPoints.aggregate([
      { $group: { _id: '$level', count: { $sum: 1 } } }
    ]);

    const recentTransactions = await PointsTransaction.find()
      .populate('userId', 'firstName lastName')
      .populate('adminId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalPoints: totalPoints[0]?.total || 0,
        levelDistribution,
        recentTransactions
      }
    });
  } catch (error) {
    console.error('Error getting points stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user's points history
exports.getUserPointsHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const history = await PointsTransaction.find({ userId })
      .populate('adminId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalTransactions = await PointsTransaction.countDocuments({ userId });

    return res.status(200).json({
      success: true,
      data: {
        history,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalTransactions / limit),
          totalTransactions,
          hasNext: skip + history.length < totalTransactions,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error getting user points history:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
