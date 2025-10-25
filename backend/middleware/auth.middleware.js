const jwt = require('jsonwebtoken');
const User = require('../models/user.model.js');

const protectRoute = async (req, res, next) => {
    try {
        let token = null;

        // Method 1: Check Authorization header
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
            console.log('Token found in Authorization header');
        }
        
        // Method 2: Check cookies
        if (!token && req.cookies && req.cookies.jwt) {
            token = req.cookies.jwt;
            console.log('Token found in cookies');
        }

        if (!token) {
            console.log("No token found");
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication token missing. Please log in.' 
            });
        }

        console.log('Token extracted:', token.substring(0, 20) + '...');
        
        // DEBUG: Check if JWT_SECRET is loaded
        console.log('JWT_SECRET present:', !!process.env.JWT_SECRET);
        console.log('JWT_SECRET value:', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 10) + '...' : 'MISSING');

        // Verify the token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Token verified successfully. User ID:", decoded.userId);
        } catch (error) {
            console.log("Token verification failed:", error.message);
            console.log("Error name:", error.name);
            
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Token expired. Please log in again.' 
                });
            }
            
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid token signature. Please log in again.' 
                });
            }
            
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token. Please log in again.' 
            });
        }

        if (!decoded.userId) {
            console.log("No userId found in decoded token");
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token format. Please log in again.' 
            });
        }

        console.log("Looking for user with ID:", decoded.userId);

        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            console.log("User not found with ID:", decoded.userId);
            return res.status(401).json({ 
                success: false, 
                message: 'User not found.' 
            });
        }

        console.log("User authenticated:", user.email, "Role:", user.role);
        req.user = user;
        next();
    } catch (error) {
        console.error("Error in authentication middleware:", error);
        res.status(500).json({ 
            success: false, 
            message: "Authentication failed. Please try again later." 
        });
    }
};

const optionalAuth = async (req, res, next) => {
    try {
        let token = null;

        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
        
        if (!token && req.cookies && req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                
                if (decoded.userId) {
                    const user = await User.findById(decoded.userId).select("-password");
                    if (user) {
                        req.user = user;
                        console.log("Optional auth: User authenticated:", user.email);
                    }
                }
            } catch (error) {
                console.log("Optional auth: Token validation failed, continuing without auth");
            }
        }

        next();
    } catch (error) {
        console.error("Error in optional auth middleware:", error);
        next();
    }
};

module.exports = protectRoute;
module.exports.authenticate = protectRoute;
module.exports.optionalAuth = optionalAuth;
module.exports.protectRoute = protectRoute;
