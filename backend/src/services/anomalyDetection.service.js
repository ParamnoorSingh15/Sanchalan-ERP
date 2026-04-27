/**
 * Statistical Anomaly Detection Engine for Sanchalan ERP
 * =========================================================
 * 
 * IMPORTANT TRANSPARENCY NOTE:
 * This system does NOT use an LSTM (Long Short-Term Memory) neural network.
 * Running a real LSTM requires Python, TensorFlow/PyTorch, and a trained model
 * file — none of which exist in this Node.js backend.
 * 
 * What this module DOES implement is a production-grade, statistically rigorous
 * anomaly scoring pipeline using:
 * 
 *   1. Rolling Z-score per user behaviour baseline  (deviation from personal mean)
 *   2. Action risk weight table                     (domain knowledge encoding)
 *   3. Contextual multipliers                       (off-hours, multiple failures, etc.)
 *   4. Sigmoid normalization                        (maps raw score → [0, 1])
 * 
 * This is the standard approach used by many enterprise SIEM systems when a
 * lightweight, interpretable model is preferred over a deep-learning black box.
 * 
 * To integrate a real LSTM in the future:
 *   - Train a model in Python on your audit log sequences
 *   - Export as ONNX or TensorFlow.js format
 *   - Load via `onnxruntime-node` or `@tensorflow/tfjs-node`
 *   - Replace `computeAnomalyScore()` below with the model's inference output
 */

const AuditLog  = require('../models/AuditLog');
const AnomalyLog = require('../models/AnomalyLog');
const { generateSecurityExplanation } = require('./anomalyExplain.service');

/* ── Action risk weights ──────────────────────────────────────── *
 * Each action type carries an intrinsic base-risk weight [0, 1]   *
 * derived from enterprise security domain knowledge.              */
const ACTION_RISK = {
    LOGIN_SUCCESS:           0.05,
    LOGIN_FAILURE:           0.55,
    LOGOUT:                  0.02,
    PASSWORD_RESET_REQUEST:  0.35,
    PASSWORD_RESET_COMPLETE: 0.25,
    ROLE_UPDATE:             0.70,
    USER_CREATED:            0.30,
    USER_DEACTIVATED:        0.60,
    TOKEN_REFRESH:           0.10,
    // Task actions (informational — lower inherent risk)
    TASK_CREATED:            0.08,
    TASK_UPDATED:            0.08,
    TASK_DELETED:            0.40,
    TASK_COMPLETED:          0.05,
    TASK_STARTED:            0.05,
    TASK_BLOCKED:            0.20,
    TASK_REASSIGNED:         0.25,
};

const DEFAULT_RISK      = 0.15; // fallback for unknown actions
const OFF_HOURS_START   = 0;
const OFF_HOURS_END     = 5;    // 00:00 – 05:59 local time

/* ── Sigmoid normalizer ───────────────────────────────────────── *
 * Maps any real-valued score to the continuous range (0, 1).      *
 * k controls steepness; x0 shifts the midpoint.                   */
function sigmoid(x, k = 5, x0 = 0.5) {
    return 1 / (1 + Math.exp(-k * (x - x0)));
}

/* ─────────────────────────────────────────────────────────────── *
 * Compute a rolling per-user baseline from the last N audit logs  *
 * for that user using Z-score:                                     *
 *   z = (current_weight - mean) / (stddev + ε)                    *
 *                                                                  *
 * High z-score → this event significantly deviates from the       *
 * user's personal behaviour baseline.                             *
 * ─────────────────────────────────────────────────────────────── */
async function computeUserBaseline(userId, windowSize = 30) {
    if (!userId) return { mean: DEFAULT_RISK, stddev: 0.1 };

    const recentLogs = await AuditLog.find({ userId })
        .sort({ timestamp: -1 })
        .limit(windowSize)
        .lean();

    if (recentLogs.length < 3) {
        // Insufficient history — return neutral baseline
        return { mean: DEFAULT_RISK, stddev: 0.15 };
    }

    const weights = recentLogs.map(l => ACTION_RISK[l.action] ?? DEFAULT_RISK);
    const mean    = weights.reduce((a, b) => a + b, 0) / weights.length;
    const variance = weights.reduce((a, w) => a + Math.pow(w - mean, 2), 0) / weights.length;
    const stddev  = Math.sqrt(variance) || 0.01; // avoid division by zero

    return { mean, stddev };
}

/* ─────────────────────────────────────────────────────────────── *
 * Main scoring function — combines:                               *
 *  1. Action base weight                                          *
 *  2. Z-score deviation from user baseline                        *
 *  3. Contextual risk multipliers                                 *
 * Normalises the final composite to [0, 1] via sigmoid.          *
 * ─────────────────────────────────────────────────────────────── */
async function computeAnomalyScore(auditLog) {
    const { userId, action, timestamp } = auditLog;
    const hour = new Date(timestamp).getHours();

    // 1. Base action weight
    const baseWeight = ACTION_RISK[action] ?? DEFAULT_RISK;

    // 2. Z-score deviation from this user's rolling baseline
    const { mean, stddev } = await computeUserBaseline(userId);
    const zScore = Math.abs((baseWeight - mean) / stddev);
    // Clamp z-score contribution to [0, 1] — extreme z values saturate safely
    const zNorm  = Math.min(zScore / 4.0, 1.0); // z=4 = max deviation contribution

    // 3. Contextual risk multipliers
    let multiplier = 1.0;
    if (hour >= OFF_HOURS_START && hour <= OFF_HOURS_END) multiplier += 0.25; // off-hours access
    if (action === 'LOGIN_FAILURE')                        multiplier += 0.20; // every failure adds risk
    if (action === 'ROLE_UPDATE')                          multiplier += 0.15; // privilege change
    if (action === 'USER_DEACTIVATED')                     multiplier += 0.10;

    // 4. Composite raw score
    const rawScore = ((baseWeight * 0.50) + (zNorm * 0.50)) * multiplier;

    // 5. Sigmoid to [0, 1]  → naturally smooth the distribution
    const finalScore = sigmoid(rawScore);

    // Round to 2dp to match dashboard display expectations
    return Math.round(finalScore * 100) / 100;
}

/* ─────────────────────────────────────────────────────────────── *
 * Process a single new audit log event through the pipeline.     *
 * Designed to be called immediately after each AuditLog.create() *
 * so the Security dashboard always reflects live data.            *
 * ─────────────────────────────────────────────────────────────── */
exports.processAuditEvent = async (auditLog, userMeta = {}) => {
    try {
        const anomaly_score = await computeAnomalyScore(auditLog);

        const event = {
            user_id:        auditLog.userId || null,
            role:           userMeta.role       || 'Unknown',
            department:     userMeta.department || 'Unknown',
            action:         auditLog.action,
            resource:       'ERP System',
            login_hour:     new Date(auditLog.timestamp || Date.now()).getHours(),
            failed_attempts: auditLog.action === 'LOGIN_FAILURE' ? 1 : 0,
            anomaly_score,
        };

        // Generate structured security explanation
        const explanation = generateSecurityExplanation(event);

        // Persist to anomaly_logs collection (safe, non-blocking for audit log writer)
        const newLog = new AnomalyLog({
            user_id:            event.user_id,
            role:               event.role,
            department:         event.department,
            action:             event.action,
            resource:           event.resource,
            anomaly_score,
            severity:           explanation.severity,
            reason:             explanation.reason,
            requires_escalation: explanation.requires_escalation ?? false,
            visualization_hint: explanation.visualization_hint,
            timestamp:          auditLog.timestamp || new Date(),
        });

        await newLog.save();
        return newLog;
    } catch (err) {
        // Never crash the calling audit log writer
        console.error('[AnomalyDetection] Failed to process audit event:', err.message);
        return null;
    }
};

/* ─────────────────────────────────────────────────────────────── *
 * Reprocess historical audit logs (called once on migration).    *
 * ─────────────────────────────────────────────────────────────── */
exports.reprocessAllLogs = async () => {
    const logs = await AuditLog.find()
        .populate('userId', 'roles departmentId')
        .sort({ timestamp: 1 })
        .lean();

    let processed = 0;
    for (const log of logs) {
        const user = log.userId || {};
        await exports.processAuditEvent(log, {
            role:       user.roles?.[0] || 'Unknown',
            department: user.departmentId?.toString() || 'Unknown',
        });
        processed++;
    }
    return processed;
};
