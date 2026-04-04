const PerformanceLog = require('../../models/PerformanceLog');

exports.addReview = async (req, res) => {
    try {
        const log = new PerformanceLog({
            ...req.body,
            reviewerId: req.user.id
        });
        await log.save();
        res.status(201).json({ success: true, data: log });
    } catch (err) {
        res.status(500).json({ error: 'Error adding review' });
    }
};

exports.getMyReviews = async (req, res) => {
    try {
        const reviews = await PerformanceLog.find({ employeeId: req.user.id }).populate('reviewerId', 'name').sort({ createdAt: -1 });
        res.status(200).json({ data: reviews });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching reviews' });
    }
};

exports.getTeamReviews = async (req, res) => {
    try {
        const reviews = await PerformanceLog.find({ reviewerId: req.user.id }).populate('employeeId', 'name designation').sort({ createdAt: -1 });
        res.status(200).json({ data: reviews });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching team reviews' });
    }
};

exports.getAll = async (req, res) => {
    try {
        const reviews = await PerformanceLog.find().populate('employeeId', 'name').populate('reviewerId', 'name').sort({ createdAt: -1 });
        res.status(200).json({ data: reviews });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching all reviews' });
    }
};
