const AuditLog = require('../models/AuditLog');

/**
 * Shared audit log helper used across multiple modules.
 * Extracted to avoid code duplication between authController and userController.
 */
const createAuditLog = async (userId, action, req, extra = null) => {
    try {
        await AuditLog.create({
            userId,
            action,
            details: {
                ip: req.ip || req.socket?.remoteAddress,
                userAgent: req.get('User-Agent'),
                extra,
            },
        });
    } catch (error) {
        // Audit log failures should never crash the application
        console.error('[AuditLog] Failed to write audit log:', error.message);
    }
};

module.exports = { createAuditLog };
