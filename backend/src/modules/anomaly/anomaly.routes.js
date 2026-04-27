const express = require('express');
const router = express.Router();
const AnomalyLog = require('../../models/AnomalyLog');
const { authenticateJWT, authorizeRoles } = require('../../middleware/auth');

// Protect all routes with existing JWT and Admin validation middleware
router.use(authenticateJWT);
router.use(authorizeRoles('Admin'));

/**
 * GET /api/anomalies/recent
 * Returns last 20 anomaly events sorted descending
 */
router.get('/recent', async (req, res) => {
    try {
        const recentAnomalies = await AnomalyLog.find()
            .sort({ timestamp: -1 })
            .limit(20)
            .lean();
        
        res.status(200).json(recentAnomalies);
    } catch (err) {
        console.error('[Anomaly API] /recent error:', err.message);
        res.status(500).json({ error: 'Failed to fetch recent anomalies' });
    }
});

/**
 * GET /api/anomalies/timeline
 * Returns timestamp + anomaly_score only, optimized for timeseries charting
 */
router.get('/timeline', async (req, res) => {
    try {
        const timeline = await AnomalyLog.find()
            .select('timestamp anomaly_score -_id')
            .sort({ timestamp: 1 })
            .lean();
            
        res.status(200).json(timeline);
    } catch (err) {
        console.error('[Anomaly API] /timeline error:', err.message);
        res.status(500).json({ error: 'Failed to fetch timeline telemetry' });
    }
});

/**
 * GET /api/anomalies/high-risk-users
 * Groups by user_id and returns the highest anomaly_score per user.
 * Joins with User model safely to return clean JSON plotting labels.
 */
router.get('/high-risk-users', async (req, res) => {
    try {
        const highRiskUsers = await AnomalyLog.aggregate([
            { $match: { user_id: { $ne: null } } },
            {
                $group: {
                    _id: "$user_id",
                    highest_anomaly_score: { $max: "$anomaly_score" },
                    latest_timestamp: { $max: "$timestamp" }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user_details'
                }
            },
            {
                $unwind: { path: "$user_details", preserveNullAndEmptyArrays: true }
            },
            {
                $project: {
                    _id: 0,
                    user_id: "$_id",
                    highest_anomaly_score: 1,
                    latest_timestamp: 1,
                    user_name: "$user_details.name",
                    user_email: "$user_details.email"
                }
            },
            {
                $sort: { highest_anomaly_score: -1 }
            }
        ]);

        res.status(200).json(highRiskUsers);
    } catch (err) {
        console.error('[Anomaly API] /high-risk-users error:', err.message);
        res.status(500).json({ error: 'Failed to generate high-risk user analytics' });
    }
});

module.exports = router;
