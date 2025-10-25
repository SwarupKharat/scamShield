const incidentModel = require('../models/incident.model')
const User = require('../models/user.model')
const reportModel = require('../models/report.model');
const mongoose = require('mongoose');

exports.getIncidentById = async (req, res) => {
    const incidentId = req.params.id;

    try {
        const incident = incidentModel.findById(incidentId);

        if(!incident){
            return res.status(404).json({ message: 'Incident not found' });
        }

        return res.json({
            incident: incident,
            message : "Fetched event"
        })
    } catch (error) {
        console.log("Error in fetching incident by ID: ", error);
        return res.json({
            message: "Error in fetching incident by ID",
            success : false,
        })
    }
}

exports.viewIncidents = async (req, res) => {
    try {
        const incidents = await incidentModel.find({});
        console.log(incidents);        
        return res.json({
            message : "Incidents fetched!",
            data : incidents,
            success : true
        });
    } catch (error) {
        console.log("Error fetching incidents",  error);
        return res.status(500).json({
            message : "Error fetching incidents",
            success : false
        });        
    }
}

exports.markIncidentAsSolved = async (req, res) => {
    try {
        const incidentId = req.params.id;

        const incident = await incidentModel.findById(incidentId);
        if (!incident) {
            return res.status(404).json({ message: "Incident not found.", success: false });
        }

        if (incident.status === 'resolved') {
            return res.status(400).json({ message: "Incident is already resolved.", success: false });
        }

        incident.status = 'resolved';
        await incident.save();

        const report = new reportModel({
            title: incident.title,
            description: incident.description,
            reportedBy: incident.reportedBy,
            status: 'resolved',
            severity: incident.severity,
            location: incident.location,
            incident: incident._id,
            attachments: incident.image,
        });

        await report.save();

        const reportedBy = await User.findById(incident.reportedBy);

        const msg = `The case "${incident.title}" is resolved. Please check the reports section.`;
        if (reportedBy && reportedBy.notifications) {
            reportedBy.notifications.push({
                text: msg,
                incidentId: incidentId,
            });
            await reportedBy.save();
        }

        return res.json({
            message: "Incident marked as resolved, and report generated.",
            success: true,
            updatedIncident: incident,
            generatedReport: report,
        });
        
    } catch (error) {
        console.error("Error marking incident as resolved:", error);
        return res.status(500).json({ message: "Internal server error.", success: false });
    }
};

exports.getUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Fetch the user by ID
        const user = await User.findById(userId).lean(); 

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        
        const filteredUser = {
            _id: user._id,
            name: user.name,
            mobile: user.mobile,
            address: user.address,
            profilePic: user.profilePic,
            email: user.email,
            role: user.role,
        };

        console.log(filteredUser);        

        return res.status(200).json({
            success: true,
            user: filteredUser,
        });
    } catch (error) {
        console.error("Error in fetching user: ", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

exports.updateIncident = async (req, res) => {
    try {
        const { message } = req.body; 
        const incidentId = req.params.id;

        console.log("Message: ", message, "IncidentId: ", incidentId);

        // Validate incident ID
        if (!mongoose.Types.ObjectId.isValid(incidentId)) {
            return res.status(400).json({
                message: "Invalid incident ID.",
                success: false,
            });
        }

        // Validate message
        if (!message || typeof message !== 'string' || message.trim() === '') {
            return res.status(400).json({
                message: "Message must be a non-empty string.",
                success: false,
            });
        }

        // Find and update the incident
        const updatedIncident = await incidentModel.findByIdAndUpdate(
            incidentId,
            { $push: { messages: { text: message, date: new Date() } } }, // Ensure 'messages' field exists in Schema
            { new: true }
        );

        if (!updatedIncident) {
            return res.status(404).json({
                message: "Incident not found.",
                success: false,
            });
        }

        // Ensure incident has a valid reporter
        if (!updatedIncident.reportedBy) {
            return res.status(400).json({
                message: "Incident reporter not found.",
                success: false,
            });
        }

        // Find reporter
        const incidentReporter = await User.findById(updatedIncident.reportedBy);
        if (!incidentReporter) {
            return res.status(404).json({
                message: "Reporter not found.",
                success: false,
            });
        }

        // Update notifications
        incidentReporter.notifications.push({
            text: message,
            incidentId: incidentId,
        });

        await incidentReporter.save();

        return res.json({
            message: "Incident updated successfully!",
            success: true,
            updatedIncident,
        });
    } catch (error) {
        console.error("Error in updating incident:", error);
        return res.status(500).json({
            message: "Internal server error.",
            success: false,
        });
    }
};

exports.assignIncident = async (req, res) => {
    try {
        const { incidentId, assignedTo } = req.body;

        if (!incidentId || !assignedTo) {
            return res.status(400).json({
                message: "Incident ID and assigned user are required",
                success: false
            });
        }

        const incident = await incidentModel.findById(incidentId);
        if (!incident) {
            return res.status(404).json({
                message: "Incident not found",
                success: false
            });
        }

        const assignedUser = await User.findById(assignedTo);
        if (!assignedUser || assignedUser.role !== 'authority') {
            return res.status(400).json({
                message: "Invalid authority user",
                success: false
            });
        }

        incident.assignedTo = assignedTo;
        incident.status = 'under review';
        await incident.save();

        // Add notification to assigned authority
        assignedUser.notifications.push({
            text: `You have been assigned incident: ${incident.title}`,
            incidentId: incidentId
        });
        await assignedUser.save();

        return res.json({
            message: "Incident assigned successfully",
            success: true,
            incident
        });
    } catch (error) {
        console.error("Error assigning incident:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

exports.updateIncidentStatus = async (req, res) => {
    try {
        const { incidentId, status } = req.body;

        if (!incidentId || !status) {
            return res.status(400).json({
                message: "Incident ID and status are required",
                success: false
            });
        }

        const validStatuses = ['reported', 'under review', 'resolved', 'dismissed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status. Must be one of: reported, under review, resolved, dismissed",
                success: false
            });
        }

        const incident = await incidentModel.findById(incidentId);
        if (!incident) {
            return res.status(404).json({
                message: "Incident not found",
                success: false
            });
        }

        incident.status = status;
        await incident.save();

        // Add notification to reporter
        const reporter = await User.findById(incident.reportedBy);
        if (reporter) {
            reporter.notifications.push({
                text: `Your incident "${incident.title}" status has been updated to: ${status}`,
                incidentId: incidentId
            });
            await reporter.save();
        }

        return res.json({
            message: "Incident status updated successfully",
            success: true,
            incident
        });
    } catch (error) {
        console.error("Error updating incident status:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

exports.getAssignedIncidents = async (req, res) => {
    try {
        const authorityId = req.user._id;
        
        const incidents = await incidentModel.find({ assignedTo: authorityId })
            .populate('reportedBy', 'firstName lastName email')
            .sort({ createdAt: -1 });

        return res.json({
            message: "Assigned incidents fetched successfully",
            success: true,
            incidents
        });
    } catch (error) {
        console.error("Error fetching assigned incidents:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

exports.getAuthorityDashboard = async (req, res) => {
    try {
        const authorityId = req.user._id;

        // Get counts for different incident statuses
        const totalAssigned = await incidentModel.countDocuments();
        const resolvedCount = await incidentModel.countDocuments({ 
           
            status: 'resolved' 
        });
        const inProgressCount = await incidentModel.countDocuments({ 
          
            status: 'under review' 
        });
        const pendingCount = await incidentModel.countDocuments({ 
         
            status: 'reported' 
        });

        // Get recent incidents
        const recentIncidents = await incidentModel.find({ assignedTo: authorityId })
            .populate('reportedBy', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(5);

        return res.json({
            success: true,
            stats: {
                totalAssigned,
                resolvedCount,
                inProgressCount,
                pendingCount,
                resolutionRate: totalAssigned > 0 ? ((resolvedCount / totalAssigned) * 100).toFixed(2) : 0
            },
            recentIncidents
        });
    } catch (error) {
        console.error("Error fetching authority dashboard:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

exports.getFeedback = async (req, res) => {
    try {
        // Get all incidents with feedback
        const incidentsWithFeedback = await incidentModel.find({
            feedback: { $exists: true, $ne: null }
        }).populate('reportedBy', 'firstName lastName');

        const feedbackData = incidentsWithFeedback.map(incident => ({
            _id: incident._id,
            incident: {
                _id: incident._id,
                title: incident.title
            },
            text: incident.feedback.text,
            rating: incident.feedback.rating,
            submittedAt: incident.feedback.submittedAt,
            reporter: incident.reportedBy
        }));

        return res.json({
            success: true,
            feedback: feedbackData
        });
    } catch (error) {
        console.error("Error fetching feedback:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};