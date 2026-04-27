const AuditLog = require('../models/AuditLog');

// Fire-and-forget anomaly scoring (imported lazily to avoid circular deps at startup)
let _anomalyDetection = null;
function getAnomalyDetector() {
    if (!_anomalyDetection) {
        _anomalyDetection = require('../services/anomalyDetection.service');
    }
    return _anomalyDetection;
}

/**
 * Shared audit log helper used across multiple modules.
 * Automatically triggers statistical anomaly scoring for every event.
 *
 * @param {string|ObjectId} userId
 * @param {string}          action    - Must match AuditLog.action enum
 * @param {Request}         req       - Express request (for IP / UA)
 * @param {object}          extra     - Optional extra metadata
 * @param {object}          userMeta  - Optional { role, department } for anomaly context
 */
const createAuditLog = async (userId, action, req, extra = null, userMeta = {}) => {
    try {
        const log = await AuditLog.create({
            userId,
            action,
            details: {
                ip:        req.ip || req.socket?.remoteAddress,
                userAgent: req.get('User-Agent'),
                extra,
            },
        });

        // Non-blocking: process anomaly score without delaying the response
        setImmediate(() => {
            getAnomalyDetector()
                .processAuditEvent(log, userMeta)
                .catch(err => console.error('[AuditLog] Anomaly scoring failed (non-fatal):', err.message));
        });
    } catch (error) {
        // Audit log failures should never crash the application
        console.error('[AuditLog] Failed to write audit log:', error.message);
    }
};

module.exports = { createAuditLog };

