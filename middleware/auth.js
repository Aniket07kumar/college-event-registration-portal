const User = require('../models/User');

const requireAuth = async (req, res, next) => {
    try {
        // 1. Check session
        if (req.session && req.session.user) {
            req.user = req.session.user;
            return next();
        }

        // 2. Check header fallback (useful for API testing / stateless requests)
        const userIdHeader = req.headers['x-user-id'];
        if (userIdHeader) {
            const user = await User.findById(userIdHeader);
            if (user) {
                req.user = user;
                return next();
            }
        }

        return res.status(401).json({
            success: false,
            message: 'Authentication required. Please log in to continue.'
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Authentication verification failed: ' + err.message
        });
    }
};

const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.'
        });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied: Administrator privileges required.'
        });
    }
    next();
};

module.exports = {
    requireAuth,
    requireAdmin
};
