const AnomalyLog = require('../models/AnomalyLog');

/**
 * Stores the anomaly log without disrupting existing audit logging flows.
 * Merges the original event data with the AI's explanation object.
 *
 * @param {Object} event - The original event payload
 * @param {Object} explanation - The AI structure (severity, reason, needs_escalation, etc.)
 */
exports.storeAnomalyLog = async (event = {}, explanation = {}) => {
    try {
        if (event.anomaly_score === undefined && explanation.anomaly_score === undefined) {
            console.warn('[AnomalyLogger] Warning: anomaly_score is missing for the given event.');
        }

        const anomalyDoc = {
            user_id: event.user_id || event.userId || explanation.user_id || null,
            role: event.role || explanation.role || 'Unknown',
            department: event.department || explanation.department || 'Unknown',
            action: event.action || explanation.action || 'Unknown',
            resource: event.resource || explanation.resource || 'Unknown',
            anomaly_score: typeof event.anomaly_score === 'number' ? event.anomaly_score : 
                           typeof explanation.anomaly_score === 'number' ? explanation.anomaly_score : null,
            
            // AI Explanation fields
            severity: explanation.severity || 'LOW',
            reason: explanation.reason || 'No reason provided',
            requires_escalation: explanation.requires_escalation || false,
            visualization_hint: explanation.visualization_hint || 'USER_RISK_TREND'
        };

        const newLog = new AnomalyLog(anomalyDoc);
        await newLog.save();

        return newLog;
    } catch (error) {
        // Safe fallback - never crash the runtime if logging fails
        console.error('[AnomalyLogger] Failed to store anomaly log:', error.message);
        return null;
    }
};
