const { verifyAccessToken } = require('../utils/jwt');

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authentication token', code: 'UNAUTHORIZED' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) {
        return res.status(401).json({ error: 'Expired or invalid token', code: 'UNAUTHORIZED' });
    }

    req.user = decoded; // { id, roles, email }
    next();
};

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.roles) {
            return res.status(403).json({ error: 'Role context missing', code: 'FORBIDDEN' });
        }

        const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
        if (!hasRole) {
            return res.status(403).json({ error: 'Insufficient permissions', code: 'FORBIDDEN' });
        }

        next();
    };
};

const checkManagerScope = async (req, res, next) => {
    // Admins bypass scope check
    if (req.user.roles.includes('Admin')) {
        return next();
    }

    if (req.user.roles.includes('Manager')) {
        try {
            const User = require('../models/User');
            const manager = await User.findById(req.user.id);
            if (!manager) {
                return res.status(404).json({ error: 'Manager profile not found', code: 'NOT_FOUND' });
            }
            if (!manager.departmentId) {
                return res.status(403).json({ error: 'Manager has no department assigned', code: 'FORBIDDEN' });
            }
            // Bind the employee strictly to the manager's department
            req.body.departmentId = manager.departmentId;
            req.body.managerId = manager._id;
            return next();
        } catch (err) {
            console.error('[AuthMiddleware] checkManagerScope error:', err.message);
            return res.status(500).json({ error: 'Internal Server Error', code: '500' });
        }
    }

    return res.status(403).json({ error: 'Insufficient permissions', code: 'FORBIDDEN' });
};

module.exports = {
    authenticateJWT,
    authorizeRoles,
    checkManagerScope
};
