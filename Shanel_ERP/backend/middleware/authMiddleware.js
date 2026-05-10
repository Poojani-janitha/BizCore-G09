const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * requireModule Middleware
 * SECTION 4 Implementation
 */
const requireModule = (moduleName) => {
    return async (req, res, next) => {
        // 1. Verify JWT signature and expiry
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authorization token required' });
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_access_secret');
            
            // 2. Check module access from token claims
            if (!decoded.modules || !decoded.modules.includes(moduleName)) {
                return res.status(403).json({
                    error: `Access denied: '${moduleName}' module not assigned`
                });
            }

            // 3. Verify user still Active in DB
            const user = await User.findByPk(decoded.sub);
            if (!user || user.Status !== 'Active') {
                return res.status(401).json({ error: 'Account inactive or disabled' });
            }

            req.user = decoded; // sub, username, user_type, modules
            next();

        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expired' });
            }
            return res.status(401).json({ error: 'Token invalid' });
        }
    };
};

module.exports = {
    requireModule
};
