const RegisteredUser = require('../models/registeredUsers.model.js'); 
const reportModel = require('../models/report.model.js')
const bcrypt = require('bcryptjs');
const cloudinary = require('../config/cloudinary.js');
const {generateToken} = require('../config/utils.js');
const User = require('../models/user.model.js');
const Incident = require('../models/incident.model.js');
const ReportModel = require('../models/report.model.js');
const Scammer = require('../models/scammer.model.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();
const locationService = require('../services/locationService.js');
const messagingService = require('../services/messagingService.js');
const incidentModel = require("../models/incident.model.js");
const userModel = require('../models/user.model.js');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Function to notify nearby users about incidents
const notifyNearbyUsers = async (incident, coordinates) => {
    try {
        // Find users within 50km radius (simplified approach)
        const nearbyUsers = await User.find({
            role: 'user',
            _id: { $ne: incident.reportedBy } // Exclude the reporter
        });

        // For each nearby user, add a notification
        for (const user of nearbyUsers) {
            const notification = {
                text: `New scam incident reported near your area: ${incident.title}`,
                incidentId: incident._id
            };
            
            user.notifications.push(notification);
            await user.save();
        }

        // Send SMS/WhatsApp alerts to nearby users
        if (nearbyUsers.length > 0) {
            const alertResults = await messagingService.sendIncidentAlert(incident, nearbyUsers);
            console.log(`Sent alerts to ${nearbyUsers.length} users:`, alertResults);
        }

        console.log(`Notified ${nearbyUsers.length} users about incident ${incident._id}`);
    } catch (error) {
        console.error('Error notifying nearby users:', error);
    }
};

exports.predictSeverity = async (description) => {
    try {
        const prompt = `Given the incident description: "${description}", predict its severity in one word (low, medium, high, critical).`;
        const result = await model.generateContent(prompt);
        return result.response.text().toLowerCase().trim();
    } catch (error) {
        console.error("Error generating content:", error);
    }
};


exports.adminSignUp = async (req, res) => {
    try {
        const { firstName, lastName, email, mobile, address, password } = req.body;

        // Validate input fields
        if (!firstName || !lastName || !email || !mobile || !address || !password) {
            return res.status(400).json({
                message: "All fields are required",
                success: false,
            });
        }

        // Check if the admin already exists
        const existingAdmin = await User.findOne({ email, role: 'admin' });
        if (existingAdmin) {
            return res.status(400).json({
                message: "Admin with this email already exists",
                success: false,
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new admin user
        const newAdmin = new User({
            firstName,
            lastName,
            email,
            mobile,
            address,
            password: hashedPassword,
            role: 'admin', // Explicitly set the role as 'admin'
        });

        // Save the admin user to the database
        await newAdmin.save();

        // Generate JWT token
        const token = generateToken(newAdmin._id, res);

        // Send response
        res.status(201).json({
            message: "Admin registered successfully",
            success: true,
            token,
            admin: {
                id: newAdmin._id,
                firstName: newAdmin.firstName,
                lastName: newAdmin.lastName,
                email: newAdmin.email,
                role: newAdmin.role,
            },
        });
    } catch (error) {
        console.error("Error in adminSignUp: ", error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};

exports.authoritySignUp = async (req, res) => {
    try {
        const { firstName, lastName, email, mobile, address, password, aadharCard } = req.body;

        // Validate input fields
        if (!firstName || !lastName || !email || !mobile || !address || !password || !aadharCard) {
            return res.status(400).json({
                message: "All fields are required, including Aadhar Card.",
                success: false,
            });
        }

        // Check if the admin already exists
        const existingAdmin = await User.findOne({ email, role: 'authority' });
        if (existingAdmin) {
            return res.status(400).json({
                message: "Admin with this email already exists.",
                success: false,
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new admin user
        const newAdmin = new User({
            firstName,
            lastName,
            email,
            mobile,
            address,
            password: hashedPassword,
            aadharCard,
            role: 'authority',
        });

        // Save the admin user to the database
        await newAdmin.save();

        // Generate JWT token
        const token = generateToken(newAdmin._id, res);

        // Send response
        res.status(201).json({
            message: "Admin registered successfully.",
            success: true,
            token,
            admin: {
                id: newAdmin._id,
                firstName: newAdmin.firstName,
                lastName: newAdmin.lastName,
                email: newAdmin.email,
                role: newAdmin.role,
            },
        });
    } catch (error) {
        console.error("Error in adminSignUp: ", error);
        res.status(500).json({
            message: "Internal server error.",
            success: false,
        });
    }
};



exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, mobile, address, password } = req.body;
    console.log(req.body);

    // Check if all required fields are provided
    if (!firstName || !lastName || !email || !mobile || !address || !password) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    // Ensure the required files were uploaded
    if (!req.files || !req.files.aadharCard || !req.files.photo) {
      return res.status(400).json({
        message: "Aadhar card and photo files are required",
        success: false,
      });
    }

    // Check if the user already exists in either collection
    const existingRegisteredUser = await RegisteredUser.findOne({ email });
    const existingUser = await User.findOne({ email });
    
    if (existingRegisteredUser || existingUser) {
      return res.status(400).json({
        message: "User already exists",
        success: false,
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Obtain file paths from multer (the files were saved to disk)
    const aadharCardPath = req.files.aadharCard[0].path;
    const photoPath = req.files.photo[0].path;

    // Create a new registered user (pending approval)
    const newUser = new RegisteredUser({
      firstName,
      lastName,
      email,
      mobile,
      aadharCard: aadharCardPath, // now storing local file path
      photo: photoPath,           // now storing local file path
      address,
      password: hashedPassword,
      status: 'pending', // explicitly set status
    });

    // Save the user to the database
    await newUser.save();

    // Send response without JWT token (user needs approval first)
    res.status(201).json({
      message: "User registered successfully. Please wait for admin approval before logging in.",
      success: true,
      userId: newUser._id,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        status: newUser.status,
      },
    });
  } catch (error) {
    console.error("Error in signup: ", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
                success: false,
            });
        }

        console.log(email);
        
        // First check if user exists in the main User collection (approved users)
        let user = await User.findOne({ email });
        
        // If not found in User collection, check RegisteredUser collection
        if (!user) {
            const registeredUser = await RegisteredUser.findOne({ email });
            if (!registeredUser) {
                return res.status(404).json({
                    message: "User not found!",
                    success: false,
                });
            }
            
            // Check if user is approved
            if (registeredUser.status !== 'approved') {
                return res.status(401).json({
                    message: `Your registration is ${registeredUser.status}. Please wait for admin approval.`,
                    success: false,
                });
            }
            
            // If approved but not in User collection, this is an error
            return res.status(500).json({
                message: "User approved but not found in main database. Please contact administrator.",
                success: false,
            });
        }

        // Check password validity
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials",
                success: false,
            });
        }

        // Generate JWT token
        const token = generateToken(user._id, res);
        // Send response
        res.json({
            message: "Login successful!",
            success: true,
            token,
            userId: user._id,
            user: user,
        });
    } catch (error) {
        console.error('Error in login: ', error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};

exports.logout = async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0, httpOnly: true });        
        res.status(200).json({
            message: "Logout successful!",
            success: true,
        });
    } catch (error) {
        console.error("Error in logout: ", error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};

exports.checkApproval = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if email is provided
        if (!email) {
            return res.status(400).json({
                message: "Email is required",
                success: false,
            });
        }

        // Find the user by email
        const user = await RegisteredUser.findOne({ email });

        // Handle case where user is not found
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            });
        }

        // Create response message and status
        const msg = `Your status is: ${user.status}`;
        const isApproved = user.status === "approved";

        // Send response
        return res.status(200).json({
            message: msg,
            success: isApproved,
        });
    } catch (error) {
        console.error("Error in fetching status: ", error);

        // Handle server error
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, mobile, address } = req.body;
        const userId = req.user._id;

        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (mobile) updateData.mobile = mobile;
        if (address) updateData.address = address;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        return res.json({
            message: "Profile updated successfully",
            success: true,
            user: updatedUser
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Current password and new password are required",
                success: false
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Current password is incorrect",
                success: false
            });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();

        return res.json({
            message: "Password changed successfully",
            success: true
        });
    } catch (error) {
        console.error("Error changing password:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

exports.getUserIncidents = async (req, res) => {
    try {
        const userId = req.user._id;
        console.log('getUserIncidents - User ID:', userId);
        console.log('getUserIncidents - User email:', req.user.email);
        console.log('getUserIncidents - User role:', req.user.role);
        
        const incidents = await Incident.find({ reportedBy: userId })
            .sort({ createdAt: -1 });

        console.log('getUserIncidents - Found incidents:', incidents.length);
        console.log('getUserIncidents - Incidents:', incidents);

        return res.json({
            message: "User incidents fetched successfully",
            success: true,
            incidents
        });
    } catch (error) {
        console.error("Error fetching user incidents:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        return res.json({
            message: "Notifications fetched successfully",
            success: true,
            notifications: user.notifications || []
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

exports.markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        // Mark specific notification as read (you can add a 'read' field to notifications)
        if (user.notifications && user.notifications.length > 0) {
            user.notifications = user.notifications.filter(notification => 
                notification._id.toString() !== notificationId
            );
            await user.save();
        }

        return res.json({
            message: "Notification marked as read",
            success: true
        });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

exports.clearAllNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        user.notifications = [];
        await user.save();

        return res.json({
            message: "All notifications cleared",
            success: true
        });
    } catch (error) {
        console.error("Error clearing notifications:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

exports.reportIncident = async (req, res) => {
  const { 
    title, 
    description, 
    location, 
    pincode,
    scammerDetails 
  } = req.body;
  
  try {
    // Validate required fields. Expect the image file from Multer in req.file.
    if (!title || !description || !location || !pincode || !req.file) {
      return res.status(400).json({
        message: "Please fill all the fields including pincode.",
        success: false,
      });
    }

    // Retrieve the image file's path from Multer
    const imagePath = req.file.path;

    // Get coordinates from pincode
    const coordinates = await locationService.getCoordinatesFromPincode(pincode);

    // Await severity prediction (remains unchanged)
    const severity = await this.predictSeverity(description);

    // Parse scammer details if provided
    let parsedScammerDetails = null;
    if (scammerDetails) {
      try {
        parsedScammerDetails = JSON.parse(scammerDetails);
      } catch (e) {
        console.warn('Invalid scammer details JSON:', e.message);
      }
    }

    // Create new incident using the local image path instead of a Cloudinary URL
    const incident = new Incident({
      title,
      description,
      location,
      pincode,
      coordinates,
      severity,
      reportedBy: req.user._id, // assuming req.user is set by your authentication middleware
      image: imagePath,
      scammerDetails: parsedScammerDetails
    });

    await incident.save();

    // Handle scammer details if provided
    if (parsedScammerDetails && parsedScammerDetails.name && parsedScammerDetails.phoneNumber) {
      try {
        // Check if scammer already exists
        const existingScammer = await Scammer.findOne({
          $or: [
            { phoneNumber: parsedScammerDetails.phoneNumber },
            ...(parsedScammerDetails.upiId ? [{ upiId: parsedScammerDetails.upiId }] : []),
            ...(parsedScammerDetails.email ? [{ email: parsedScammerDetails.email }] : [])
          ]
        });

        if (existingScammer) {
          // Add report to existing scammer
          await existingScammer.addReport(req.user._id, incident._id);
          incident.scammerId = existingScammer._id;
          await incident.save();
        } else {
          // Create new scammer entry
          const scammer = new Scammer({
            name: parsedScammerDetails.name,
            phoneNumber: parsedScammerDetails.phoneNumber,
            upiId: parsedScammerDetails.upiId,
            email: parsedScammerDetails.email,
            website: parsedScammerDetails.website,
            scamType: parsedScammerDetails.scamType || 'other',
            description: parsedScammerDetails.description || description,
            socialMediaHandles: parsedScammerDetails.socialMediaHandles || [],
            evidence: parsedScammerDetails.evidence || [],
            lastKnownLocation: location,
            pincode: pincode,
            coordinates: coordinates,
            aliases: parsedScammerDetails.aliases || [],
            reportedBy: [{
              user: req.user._id,
              incidentId: incident._id
            }],
            reportCount: 1,
            totalReports: 1,
            uniqueReporters: 1,
            lastReportedAt: new Date()
          });

          await scammer.save();
          incident.scammerId = scammer._id;
          await incident.save();
        }
      } catch (scammerError) {
        console.error('Error handling scammer details:', scammerError);
        // Don't fail the incident report if scammer handling fails
      }
    }

    // Notify nearby users about the incident
    await notifyNearbyUsers(incident, coordinates);

    res.status(201).json({
      message: "Incident reported successfully!",
      incident,
    });
  } catch (error) {
    console.error("Error in reporting incident: ", error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

exports.getReport = async (req, res) => {
    try {
        const reportId = req.params.id;
        const report = reportModel.findById(reportId);

        if(!report){
            return res.json({
                message: "Report not found",
                success: false
            })
        }

        return res.json({
            report: report,
            success: true,
            message : "Success in fetching report!"
        })
    } catch (error) {
        console.log("Error in fetching report: ", error);
        return res.json({
            message: "Internal Server Error",
            success: false
        })        
    }
}

exports.viewIncident = async (req, res) => {
    const incidentId = req.params.id;

    try {
        const incident = await incidentModel.findById(incidentId);

        console.log(incident);        

        if(!incident){
            return res.json({
                success: false, 
                message : "Incident doesn't exists!",
            })
        }

        return res.json({
            success : true,
            message : "Incident fetched successfully!",
            incident : incident,
        })
    } catch (error) {
        console.log("Error in viewing incident: ", error);
        return res.json({
            success : false,
            message : "Internal Server Error",
        })
    }
}

exports.viewReport = async (req, res) => {
    const incidentId = req.params.id;
    try {
        const incident = await incidentModel.findById(incidentId);

        if(!incident){
            return res.json({
                success : false, 
                message : "Incident not found!"
            });
        }

        const reportId = incident.report;

        const report = await reportModel.findById(reportId);

        console.log(report);

        if(!report){
            return res.json({
                success : false, 
                message : "Report not found!",
            });
        }

        return res.json({
            success : true,
            message : "Report fetched successfully!",
            report : report
        })

    } catch (error) {
        console.log("Error in fetching report: ", error);
        return res.json({
            success : false, 
            message : "Internal server error"
        })
    }
}

exports.submitFeedback = async (req, res) => {
    try {
        const { incidentId, feedback, rating } = req.body;
        const userId = req.user._id;

        // Validate input
        if (!incidentId || !feedback || !rating) {
            return res.status(400).json({
                success: false,
                message: 'Incident ID, feedback, and rating are required'
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        // Find the incident
        const incident = await Incident.findById(incidentId);
        if (!incident) {
            return res.status(404).json({
                success: false,
                message: 'Incident not found'
            });
        }

        // Check if user is the reporter of this incident
        if (incident.reportedBy.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only provide feedback for incidents you reported'
            });
        }

        // Check if incident is resolved
        if (incident.status !== 'resolved') {
            return res.status(400).json({
                success: false,
                message: 'Feedback can only be provided for resolved incidents'
            });
        }

        // Check if feedback already exists
        if (incident.feedback) {
            return res.status(400).json({
                success: false,
                message: 'Feedback has already been submitted for this incident'
            });
        }

        // Add feedback to incident
        incident.feedback = {
            text: feedback,
            rating: rating,
            submittedAt: new Date(),
            submittedBy: userId
        };

        await incident.save();

        // Notify authorities about the feedback
        const authorities = await User.find({ role: 'authority' });
        for (const authority of authorities) {
            authority.notifications.push({
                text: `New feedback received for incident: ${incident.title}`,
                incidentId: incidentId,
                type: 'feedback'
            });
            await authority.save();
        }

        return res.json({
            success: true,
            message: 'Feedback submitted successfully'
        });

    } catch (error) {
        console.error('Error submitting feedback:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

exports.getCurrentUser = async (req, res) => {
    try {
        // The user is already attached to req by the auth middleware
        const user = req.user;
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Return user data without sensitive information
        const userData = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            mobile: user.mobile,
            address: user.address,
            role: user.role,
            aadharCard: user.aadharCard,
            profilePic: user.profilePic,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.status(200).json({
            success: true,
            user: userData
        });
    } catch (error) {
        console.error('Error in getCurrentUser:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
