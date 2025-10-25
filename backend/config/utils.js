const jwt = require('jsonwebtoken');

exports.generateToken = (userId, res) => {
    // Generate JWT token
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: true,       // HTTPS only
        sameSite: 'none',   // cross-site cookie
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 day
      });

    return token;
};