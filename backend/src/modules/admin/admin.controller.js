const AuditLog = require('../../models/AuditLog');
const User = require('../../models/User');
const LeaveRequest = require('../../models/LeaveRequest');
const Attendance = require('../../models/Attendance');
const Department = require('../../models/Department');
const PerformanceLog = require('../../models/PerformanceLog');
const Task = require('../../models/Task');

/**
 * GET /api/admin/stats
 * Returns live dashboard statistics from the database.
 */
exports.getStats = async (req, res) => {
    try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const [totalUsers, totalEmployees, totalManagers, totalDepartments, pendingLeaves, todayAttendance, recentFailedLogins, avgPerformance, totalTasks, activeTasks, criticalTasks] = await Promise.all([
            User.countDocuments({ isActive: true }),
            User.countDocuments({ roles: 'Employee', isActive: true }),
            User.countDocuments({ roles: 'Manager', isActive: true }),
            Department.countDocuments(),
            LeaveRequest.countDocuments({ status: 'Pending' }),
            Attendance.countDocuments({ date: today }),
            AuditLog.countDocuments({ action: { $regex: /FAILURE/i } }),
            PerformanceLog.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
            Task.countDocuments(),
            Task.countDocuments({ status: { $in: ['Assigned', 'In Progress'] } }),
            Task.countDocuments({ priority: 'Critical', status: { $ne: 'Completed' } })
        ]);

        res.status(200).json({
            totalUsers,
            totalEmployees,
            totalManagers,
            totalDepartments,
            pendingLeaves,
            todayAttendance,
            securityAlerts: recentFailedLogins,
            avgPerformance: avgPerformance[0]?.avg ? parseFloat(avgPerformance[0].avg.toFixed(1)) : 0,
            tasks: { total: totalTasks, active: activeTasks, critical: criticalTasks }
        });
    } catch (err) {
        console.error('[Admin] getStats error:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getAuditLogs = async (req, res) => {
    try {
        const { from, to, event } = req.query;
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
        const skip = (page - 1) * limit;

        const query = {};

        if (from || to) {
            query.timestamp = {};
            if (from) query.timestamp.$gte = new Date(from);
            if (to) query.timestamp.$lte = new Date(to);
        }

        if (event) {
            query.action = event;
        }

        const [logs, total] = await Promise.all([
            AuditLog.find(query)
                .populate('userId', 'name email roles')
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            AuditLog.countDocuments(query),
        ]);

        res.status(200).json({
            data: logs,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        console.error('[Admin] getAuditLogs error:', err.message);
        res.status(500).json({ error: 'Internal Server Error', code: '500' });
    }
};
