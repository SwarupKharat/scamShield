const mongoose = require('mongoose');

const pointsTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['earned', 'deducted'],
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum: ['incident_report', 'video_upload', 'community_post', 'admin_action', 'fake_incident', 'inappropriate_content', 'genuine_incident'],
    required: true
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'sourceRef'
  },
  sourceRef: {
    type: String,
    enum: ['Incident', 'CommunityPost', 'Video']
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  description: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const userPointsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  totalPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  level: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
    default: 'Bronze'
  },
  badges: [{
    name: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  achievements: [{
    name: String,
    description: String,
    points: Number,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update level based on points
userPointsSchema.methods.updateLevel = function() {
  if (this.totalPoints >= 10000) {
    this.level = 'Diamond';
  } else if (this.totalPoints >= 5000) {
    this.level = 'Platinum';
  } else if (this.totalPoints >= 2000) {
    this.level = 'Gold';
  } else if (this.totalPoints >= 500) {
    this.level = 'Silver';
  } else {
    this.level = 'Bronze';
  }
  this.lastUpdated = new Date();
};

// Add points to user
userPointsSchema.methods.addPoints = async function(points, reason, source, sourceId, sourceRef, adminId = null) {
  this.totalPoints += points;
  this.updateLevel();
  await this.save();

  // Create transaction record
  const transaction = new PointsTransaction({
    userId: this.userId,
    points: points,
    type: points > 0 ? 'earned' : 'deducted',
    reason: reason,
    source: source,
    sourceId: sourceId,
    sourceRef: sourceRef,
    adminId: adminId,
    description: `${points > 0 ? 'Earned' : 'Lost'} ${Math.abs(points)} points for ${reason}`
  });

  await transaction.save();
  return transaction;
};

// Deduct points from user
userPointsSchema.methods.deductPoints = async function(points, reason, source, sourceId, sourceRef, adminId = null) {
  this.totalPoints = Math.max(0, this.totalPoints - points);
  this.updateLevel();
  await this.save();

  // Create transaction record
  const transaction = new PointsTransaction({
    userId: this.userId,
    points: -points,
    type: 'deducted',
    reason: reason,
    source: source,
    sourceId: sourceId,
    sourceRef: sourceRef,
    adminId: adminId,
    description: `Lost ${points} points for ${reason}`
  });

  await transaction.save();
  return transaction;
};

// Get user's points history
userPointsSchema.methods.getPointsHistory = async function(limit = 50) {
  return await PointsTransaction.find({ userId: this.userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('adminId', 'firstName lastName');
};

// Get leaderboard
userPointsSchema.statics.getLeaderboard = async function(limit = 100) {
  return await this.find()
    .populate('userId', 'firstName lastName email')
    .sort({ totalPoints: -1 })
    .limit(limit);
};

// Get user rank
userPointsSchema.methods.getRank = async function() {
  const usersWithHigherPoints = await this.constructor.countDocuments({
    totalPoints: { $gt: this.totalPoints }
  });
  return usersWithHigherPoints + 1;
};

// Award points for different actions
userPointsSchema.statics.awardPoints = async function(userId, points, reason, source, sourceId, sourceRef, adminId = null) {
  let userPoints = await this.findOne({ userId });
  
  if (!userPoints) {
    userPoints = new this({ userId, totalPoints: 0 });
  }

  return await userPoints.addPoints(points, reason, source, sourceId, sourceRef, adminId);
};

// Deduct points for violations
userPointsSchema.statics.deductPoints = async function(userId, points, reason, source, sourceId, sourceRef, adminId) {
  let userPoints = await this.findOne({ userId });
  
  if (!userPoints) {
    userPoints = new this({ userId, totalPoints: 0 });
  }

  return await userPoints.deductPoints(points, reason, source, sourceId, sourceRef, adminId);
};

const UserPoints = mongoose.model('UserPoints', userPointsSchema);
const PointsTransaction = mongoose.model('PointsTransaction', pointsTransactionSchema);

module.exports = { UserPoints, PointsTransaction };
