const Scammer = require('../models/scammer.model.js');
const Incident = require('../models/incident.model.js');
const User = require('../models/user.model.js');

// Get all scammers with filtering and pagination
const getAllScammers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        const { 
            search, 
            verificationStatus, 
            scamType, 
            riskLevel,
            sortBy = 'reportCount',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = { isActive: true };
        
        if (verificationStatus) {
            filter.verificationStatus = verificationStatus;
        }
        
        if (scamType) {
            filter.scamType = scamType;
        }
        
        if (riskLevel) {
            filter.riskLevel = riskLevel;
        }

        // Build search query
        let searchQuery = {};
        if (search) {
            searchQuery = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { phoneNumber: { $regex: search, $options: 'i' } },
                    { upiId: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { website: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { aliases: { $in: [new RegExp(search, 'i')] } }
                ]
            };
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const scammers = await Scammer.find({ ...filter, ...searchQuery })
            .populate('reportedBy.user', 'name email')
            .populate('verifiedBy', 'name email')
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const totalScammers = await Scammer.countDocuments({ ...filter, ...searchQuery });
        const totalPages = Math.ceil(totalScammers / limit);

        res.json({
            success: true,
            data: {
                scammers,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalScammers,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Error fetching scammers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch scammers',
            error: error.message
        });
    }
};

// Get scammer by ID
const getScammerById = async (req, res) => {
    try {
        const { id } = req.params;

        const scammer = await Scammer.findById(id)
            .populate('reportedBy.user', 'name email')
            .populate('verifiedBy', 'name email')
            .populate('adminNotes.addedBy', 'name email');

        if (!scammer) {
            return res.status(404).json({
                success: false,
                message: 'Scammer not found'
            });
        }

        res.json({
            success: true,
            data: scammer
        });
    } catch (error) {
        console.error('Error fetching scammer:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch scammer',
            error: error.message
        });
    }
};

// Create new scammer entry
const createScammer = async (req, res) => {
    try {
        const {
            name,
            phoneNumber,
            upiId,
            email,
            website,
            scamType,
            description,
            socialMediaHandles,
            evidence,
            lastKnownLocation,
            pincode,
            aliases
        } = req.body;

        // Check if scammer already exists
        const existingScammer = await Scammer.findOne({
            $or: [
                { phoneNumber },
                ...(upiId ? [{ upiId }] : []),
                ...(email ? [{ email }] : [])
            ]
        });

        if (existingScammer) {
            // Add report to existing scammer
            await existingScammer.addReport(req.user.id, req.body.incidentId);
            
            return res.json({
                success: true,
                message: 'Report added to existing scammer',
                data: existingScammer
            });
        }

        // Create new scammer
        const scammer = new Scammer({
            name,
            phoneNumber,
            upiId,
            email,
            website,
            scamType,
            description,
            socialMediaHandles: socialMediaHandles || [],
            evidence: evidence || [],
            lastKnownLocation,
            pincode,
            aliases: aliases || [],
            reportedBy: [{
                user: req.user.id,
                incidentId: req.body.incidentId
            }],
            reportCount: 1,
            totalReports: 1,
            uniqueReporters: 1,
            lastReportedAt: new Date()
        });

        await scammer.save();
        await scammer.populate('reportedBy.user', 'name email');

        res.status(201).json({
            success: true,
            message: 'Scammer entry created successfully',
            data: scammer
        });
    } catch (error) {
        console.error('Error creating scammer:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create scammer entry',
            error: error.message
        });
    }
};

// Update scammer verification status (Admin only)
const updateScammerVerification = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason, notes } = req.body;

        const scammer = await Scammer.findById(id);
        if (!scammer) {
            return res.status(404).json({
                success: false,
                message: 'Scammer not found'
            });
        }

        if (status === 'verified') {
            await scammer.verify(req.user.id, notes);
        } else if (status === 'rejected') {
            await scammer.reject(req.user.id, reason, notes);
        } else {
            scammer.verificationStatus = status;
            if (notes) {
                scammer.adminNotes.push({
                    note: notes,
                    addedBy: req.user.id
                });
            }
            await scammer.save();
        }

        await scammer.populate('verifiedBy', 'name email');
        await scammer.populate('adminNotes.addedBy', 'name email');

        res.json({
            success: true,
            message: `Scammer ${status} successfully`,
            data: scammer
        });
    } catch (error) {
        console.error('Error updating scammer verification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update scammer verification',
            error: error.message
        });
    }
};

// Add admin note to scammer
const addAdminNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { note } = req.body;

        const scammer = await Scammer.findById(id);
        if (!scammer) {
            return res.status(404).json({
                success: false,
                message: 'Scammer not found'
            });
        }

        scammer.adminNotes.push({
            note,
            addedBy: req.user.id
        });

        await scammer.save();
        await scammer.populate('adminNotes.addedBy', 'name email');

        res.json({
            success: true,
            message: 'Admin note added successfully',
            data: scammer.adminNotes[scammer.adminNotes.length - 1]
        });
    } catch (error) {
        console.error('Error adding admin note:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add admin note',
            error: error.message
        });
    }
};

// Get scammer statistics
const getScammerStatistics = async (req, res) => {
    try {
        const stats = await Scammer.getStatistics();
        const scamTypeStats = await Scammer.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$scamType', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const riskLevelStats = await Scammer.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$riskLevel', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const verificationStats = await Scammer.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$verificationStatus', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            data: {
                overview: stats[0] || {},
                scamTypeStats,
                riskLevelStats,
                verificationStats
            }
        });
    } catch (error) {
        console.error('Error fetching scammer statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch scammer statistics',
            error: error.message
        });
    }
};

// Search scammers
const searchScammers = async (req, res) => {
    try {
        const { query, filters = {} } = req.query;
        
        const scammers = await Scammer.searchScammers(query, JSON.parse(filters || '{}'));

        res.json({
            success: true,
            data: scammers
        });
    } catch (error) {
        console.error('Error searching scammers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search scammers',
            error: error.message
        });
    }
};

// Get top scammers (most reported)
const getTopScammers = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const scammers = await Scammer.find({ isActive: true })
            .populate('reportedBy.user', 'name email')
            .sort({ reportCount: -1, totalReports: -1 })
            .limit(limit);

        res.json({
            success: true,
            data: scammers
        });
    } catch (error) {
        console.error('Error fetching top scammers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch top scammers',
            error: error.message
        });
    }
};

// Delete scammer (soft delete)
const deleteScammer = async (req, res) => {
    try {
        const { id } = req.params;

        const scammer = await Scammer.findById(id);
        if (!scammer) {
            return res.status(404).json({
                success: false,
                message: 'Scammer not found'
            });
        }

        scammer.isActive = false;
        await scammer.save();

        res.json({
            success: true,
            message: 'Scammer deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting scammer:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete scammer',
            error: error.message
        });
    }
};

module.exports = {
    getAllScammers,
    getScammerById,
    createScammer,
    updateScammerVerification,
    addAdminNote,
    getScammerStatistics,
    searchScammers,
    getTopScammers,
    deleteScammer
};
