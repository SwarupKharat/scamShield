const messagingService = require('../services/messagingService.js');
const User = require('../models/user.model.js');
const Incident = require('../models/incident.model.js');

// Send helpline message
const sendHelplineMessage = async (req, res) => {
    try {
        const { mobile, message, messageType } = req.body;
        const userId = req.user ? req.user.id : null;

        if (!mobile || !message) {
            return res.status(400).json({
                success: false,
                message: 'Mobile number and message are required'
            });
        }

        let responseMessage = message;

        // Handle different message types
        switch (messageType) {
            case 'welcome':
                responseMessage = messagingService.formatHelplineWelcome();
                break;
            case 'verify':
                const { verificationData } = req.body;
                responseMessage = messagingService.formatVerificationResponse(
                    verificationData.isScam,
                    verificationData.details
                );
                break;
            case 'tips':
                const tipsResult = await messagingService.sendSafetyTips(mobile);
                return res.json({
                    success: true,
                    message: 'Safety tips sent successfully',
                    data: tipsResult
                });
            case 'emergency':
                const { emergencyType, location } = req.body;
                const emergencyResult = await messagingService.sendEmergencyAlert(
                    mobile,
                    emergencyType,
                    location
                );
                return res.json({
                    success: true,
                    message: 'Emergency alert sent successfully',
                    data: emergencyResult
                });
        }

        const results = await messagingService.sendHelplineResponse(mobile, responseMessage);

        res.json({
            success: true,
            message: 'Helpline message sent successfully',
            data: results
        });
    } catch (error) {
        console.error('Error sending helpline message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send helpline message',
            error: error.message
        });
    }
};

// Get helpline statistics
const getHelplineStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalIncidents = await Incident.countDocuments();
        const recentIncidents = await Incident.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select('title location severity createdAt');

        res.json({
            success: true,
            data: {
                totalUsers,
                totalIncidents,
                recentIncidents,
                helplineNumbers: {
                    sms: process.env.HELPLINE_SMS_NUMBER || '+91-XXXX-XXXXXX',
                    whatsapp: process.env.HELPLINE_WHATSAPP_NUMBER || '+91-XXXX-XXXXXX',
                    phone: process.env.HELPLINE_PHONE_NUMBER || '+91-XXXX-XXXXXX'
                }
            }
        });
    } catch (error) {
        console.error('Error fetching helpline stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch helpline statistics',
            error: error.message
        });
    }
};

// Send bulk alert to users
const sendBulkAlert = async (req, res) => {
    try {
        const { message, targetUsers, region, severity } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Build filter for target users
        let userFilter = { role: 'user' };
        if (region) {
            // This would need to be implemented based on your user location data
            // For now, we'll send to all users
        }

        const users = await User.find(userFilter).select('mobile name');
        const results = [];

        for (const user of users) {
            if (user.mobile) {
                const smsResult = await messagingService.sendSMS(user.mobile, message);
                const whatsappResult = await messagingService.sendWhatsApp(user.mobile, message);
                
                results.push({
                    user: user.name,
                    mobile: user.mobile,
                    sms: smsResult,
                    whatsapp: whatsappResult
                });
            }
        }

        res.json({
            success: true,
            message: 'Bulk alert sent successfully',
            data: {
                totalSent: results.length,
                results
            }
        });
    } catch (error) {
        console.error('Error sending bulk alert:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send bulk alert',
            error: error.message
        });
    }
};

// Verify scam report
const verifyScamReport = async (req, res) => {
    try {
        const { reportData, userMobile } = req.body;

        if (!reportData || !userMobile) {
            return res.status(400).json({
                success: false,
                message: 'Report data and user mobile are required'
            });
        }

        // Simple scam detection logic (you can enhance this with AI)
        const scamKeywords = [
            'urgent', 'immediately', 'act now', 'limited time',
            'free money', 'lottery', 'inheritance', 'tax refund',
            'bank account', 'suspended', 'verify', 'update',
            'click here', 'download', 'congratulations'
        ];

        const reportText = `${reportData.title} ${reportData.description}`.toLowerCase();
        const scamScore = scamKeywords.filter(keyword => 
            reportText.includes(keyword)
        ).length;

        const isScam = scamScore >= 2; // Threshold for scam detection
        const details = isScam ? 
            `Detected ${scamScore} suspicious keywords` : 
            'No obvious scam indicators found';

        const responseMessage = messagingService.formatVerificationResponse(isScam, details);
        const results = await messagingService.sendHelplineResponse(userMobile, responseMessage);

        res.json({
            success: true,
            message: 'Scam verification completed',
            data: {
                isScam,
                scamScore,
                details,
                results
            }
        });
    } catch (error) {
        console.error('Error verifying scam report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify scam report',
            error: error.message
        });
    }
};

// Get helpline templates
const getHelplineTemplates = async (req, res) => {
    try {
        const templates = {
            welcome: {
                name: 'Welcome Message',
                description: 'Welcome new users to helpline',
                template: messagingService.formatHelplineWelcome()
            },
            incidentAlert: {
                name: 'Incident Alert',
                description: 'Alert users about nearby incidents',
                template: '🚨 SCAM ALERT 🚨\n\nNew scam incident reported near your area...'
            },
            safetyTips: {
                name: 'Safety Tips',
                description: 'Send scam prevention tips',
                template: '🛡️ SCAM PREVENTION TIPS 🛡️\n\n📱 PHONE SCAMS...'
            },
            emergency: {
                name: 'Emergency Alert',
                description: 'Send emergency notifications',
                template: '🚨 EMERGENCY ALERT 🚨\n\nURGENT: Emergency situation...'
            },
            verification: {
                name: 'Scam Verification',
                description: 'Verify if something is a scam',
                template: '✅ VERIFICATION COMPLETE ✅\n\nThis appears to be...'
            }
        };

        res.json({
            success: true,
            data: templates
        });
    } catch (error) {
        console.error('Error fetching helpline templates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch helpline templates',
            error: error.message
        });
    }
};

module.exports = {
    sendHelplineMessage,
    getHelplineStats,
    sendBulkAlert,
    verifyScamReport,
    getHelplineTemplates
};
