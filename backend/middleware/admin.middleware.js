const adminProtect = async (req, res, next) => {
    try {
        const user = req.user;

        if (!user) {
            console.log("User not authorized");
            return res.status(401).json({ message: 'Unauthorized', success: false });
        }

        if (user.role !== 'admin' && user.role !== 'authority') {
            return res.status(403).json({
                message: "Access denied",
                success: false
            });
        }

        next();
    } catch (error) {
        console.log("Error in authority protection: ", error);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

module.exports = adminProtect