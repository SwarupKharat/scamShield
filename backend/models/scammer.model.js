const mongoose = require('mongoose');

const scammerSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
        unique: false
    },
    upiId: {
        type: String,
        trim: true,
        sparse: true // Allows multiple null values but enforces uniqueness for non-null values
    },
    email: {
        type: String,
        trim: true,
        sparse: true
    },
    website: {
        type: String,
        trim: true,
        sparse: true
    },
    
    // Scam Details
    scamType: {
        type: String,
        required: true,
        enum: ['phishing', 'investment', 'romance', 'tech-support', 'fake-calls', 'social-media', 'upi-fraud', 'banking', 'other']
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    
    // Verification Status
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected', 'under-review'],
        default: 'pending'
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verifiedAt: {
        type: Date
    },
    rejectionReason: {
        type: String,
        trim: true
    },
    
    // Reporting Information
    reportedBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        reportedAt: {
            type: Date,
            default: Date.now
        },
        incidentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Incident'
        }
    }],
    reportCount: {
        type: Number,
        default: 0
    },
    
    // Location Information
    lastKnownLocation: {
        type: String,
        trim: true
    },
    pincode: {
        type: String,
        trim: true
    },
    coordinates: {
        latitude: {
            type: Number
        },
        longitude: {
            type: Number
        }
    },
    
    // Additional Details
    aliases: [{
        type: String,
        trim: true
    }],
    socialMediaHandles: [{
        platform: {
            type: String,
            enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'telegram', 'whatsapp', 'other']
        },
        handle: {
            type: String,
            trim: true
        }
    }],
    
    // Evidence
    evidence: [{
        type: {
            type: String,
            enum: ['screenshot', 'call-recording', 'message', 'document', 'other']
        },
        url: {
            type: String,
            required: true
        },
        description: {
            type: String,
            trim: true
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Risk Assessment
    riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Admin Notes
    adminNotes: [{
        note: {
            type: String,
            required: true
        },
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Statistics
    totalReports: {
        type: Number,
        default: 0
    },
    uniqueReporters: {
        type: Number,
        default: 0
    },
    lastReportedAt: {
        type: Date
    }
}, { 
    timestamps: true 
});

// Indexes for better performance
scammerSchema.index({ phoneNumber: 1 });
scammerSchema.index({ upiId: 1 });
scammerSchema.index({ email: 1 });
scammerSchema.index({ verificationStatus: 1 });
scammerSchema.index({ scamType: 1 });
scammerSchema.index({ riskLevel: 1 });
scammerSchema.index({ isActive: 1 });
scammerSchema.index({ createdAt: -1 });

// Virtual for getting unique reporters count
scammerSchema.virtual('uniqueReportersCount').get(function() {
    return this.reportedBy.length;
});

// Method to add a new report
scammerSchema.methods.addReport = function(userId, incidentId) {
    // Check if user already reported this scammer
    const existingReport = this.reportedBy.find(report => 
        report.user.toString() === userId.toString()
    );
    
    if (!existingReport) {
        this.reportedBy.push({
            user: userId,
            incidentId: incidentId
        });
        this.reportCount += 1;
        this.totalReports += 1;
        this.uniqueReporters = this.reportedBy.length;
        this.lastReportedAt = new Date();
    }
    
    return this.save();
};

// Method to verify scammer
scammerSchema.methods.verify = function(adminId, notes = '') {
    this.verificationStatus = 'verified';
    this.verifiedBy = adminId;
    this.verifiedAt = new Date();
    
    if (notes) {
        this.adminNotes.push({
            note: notes,
            addedBy: adminId
        });
    }
    
    return this.save();
};

// Method to reject scammer
scammerSchema.methods.reject = function(adminId, reason, notes = '') {
    this.verificationStatus = 'rejected';
    this.verifiedBy = adminId;
    this.verifiedAt = new Date();
    this.rejectionReason = reason;
    
    if (notes) {
        this.adminNotes.push({
            note: notes,
            addedBy: adminId
        });
    }
    
    return this.save();
};

// Static method to search scammers
scammerSchema.statics.searchScammers = function(query, filters = {}) {
    const searchQuery = {
        isActive: true,
        ...filters
    };
    
    if (query) {
        searchQuery.$or = [
            { name: { $regex: query, $options: 'i' } },
            { phoneNumber: { $regex: query, $options: 'i' } },
            { upiId: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
            { website: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { aliases: { $in: [new RegExp(query, 'i')] } }
        ];
    }
    
    return this.find(searchQuery)
        .populate('reportedBy.user', 'name email')
        .populate('verifiedBy', 'name email')
        .sort({ reportCount: -1, createdAt: -1 });
};

// Static method to get scammer statistics
scammerSchema.statics.getStatistics = function() {
    return this.aggregate([
        {
            $group: {
                _id: null,
                totalScammers: { $sum: 1 },
                verifiedScammers: {
                    $sum: { $cond: [{ $eq: ['$verificationStatus', 'verified'] }, 1, 0] }
                },
                pendingScammers: {
                    $sum: { $cond: [{ $eq: ['$verificationStatus', 'pending'] }, 1, 0] }
                },
                rejectedScammers: {
                    $sum: { $cond: [{ $eq: ['$verificationStatus', 'rejected'] }, 1, 0] }
                },
                totalReports: { $sum: '$totalReports' },
                averageReports: { $avg: '$reportCount' }
            }
        }
    ]);
};

module.exports = mongoose.model('Scammer', scammerSchema);
