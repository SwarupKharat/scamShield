const registeredUsersModel = require('../models/registeredUsers.model');
const User = require('../models/user.model.js'); 
const Incident = require('../models/incident.model.js');
const bcrypt = require('bcryptjs')

exports.verify = async (req, res) => {
    try {
        const id = req.params.id;
        const { approval } = req.body;

        console.log("Id: ", id, " Approval: ", approval)

        if (!id || approval == null) {  // Handles both null and undefined
            return res.status(400).json({
                success: false,
                message: "User ID and approval status are required",
            });
        }

        const user = await registeredUsersModel.findById(id);

        console.log(user);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (approval === true) {
            // Approve user
            const name = `${user.firstName} ${user.lastName}`;
            const newUser = new User({
                name: name,
                email: user.email,
                address: user.address,
                aadharCard: user.aadharCard,
                profilePic: user.photo,
                mobile: user.mobile,
                firstName: user.firstName,
                lastName: user.lastName,
                password: user.password,
            });

            await newUser.save();
            await registeredUsersModel.findByIdAndDelete(id);  // Ensure user is deleted after newUser is saved

            return res.status(200).json({
                success: true,
                message: "User approved successfully and moved to the main database",
            });
        } else {
            // Reject user
            user.status = 'rejected';
            await user.save();

            return res.status(200).json({
                success: true,
                message: "User rejected successfully",
            });
        }
    } catch (error) {
        console.error("Error in user verification:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

exports.viewRegistrations = async (req, res) => {
    try {
        // Fetch all registered users
        const registeredUsers = await registeredUsersModel.find();

        if (!registeredUsers.length) {
            return res.status(404).json({
                success: false,
                message: "No registered users found",
            });
        }

        // Format the response to include necessary fields
        const formattedUsers = registeredUsers.map(user => ({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            mobile: user.mobile,
            status: user.status, // Include the approval status
            aadharCard: user.aadharCard,
            photo: user.photo,
            createdAt: user.createdAt,
        }));

        return res.status(200).json({
            success: true,
            users: formattedUsers,
        });
    } catch (error) {
        console.error("Error in viewing registrations: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

exports.removeUser = async (req, res) => {
    try {
        const userId = req.params.ID; 

        const response = await User.findByIdAndDelete(userId); 

        if (response) {
            res.json({
                success: true,
                message: "User deleted successfully",
            });
        } else {
            res.json({
                success: false,
                message: "User not found", // Handle case when user is not found
            });
        }
    } catch (error) {
        console.error("Error in deleting user: ", error); // Log the error for debugging
        res.status(500).json({
            success: false,
            message: "Internal server error", // Return appropriate error response
        });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).select('-password');
        
        return res.status(200).json({
            success: true,
            users: users,
            count: users.length
        });
    } catch (error) {
        console.error("Error in fetching all users: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        // Get counts for different entities
        const totalUsers = await User.countDocuments({ role: 'user' });
        const pendingRegistrations = await registeredUsersModel.countDocuments({ status: 'pending' });
        const totalIncidents = await Incident.countDocuments();
        const resolvedIncidents = await Incident.countDocuments({ status: 'resolved' });
        const openIncidents = await Incident.countDocuments({ status: 'reported' });
        const inProgressIncidents = await Incident.countDocuments({ status: 'under review' });

        // Get recent incidents
        const recentIncidents = await Incident.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('reportedBy', 'firstName lastName email');

        // Get monthly incident trends (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyStats = await Incident.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        return res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                pendingRegistrations,
                totalIncidents,
                resolvedIncidents,
                openIncidents,
                inProgressIncidents,
                resolutionRate: totalIncidents > 0 ? ((resolvedIncidents / totalIncidents) * 100).toFixed(2) : 0
            },
            recentIncidents,
            monthlyStats
        });
    } catch (error) {
        console.error("Error in fetching dashboard stats: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};