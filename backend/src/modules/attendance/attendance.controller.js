const Attendance = require('../../models/Attendance');
const User = require('../../models/User');

exports.checkIn = async (req, res) => {
    try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        let attendance = await Attendance.findOne({ employeeId: req.user.id, date: today });
        if (attendance) return res.status(400).json({ error: 'Already checked in today' });

        attendance = new Attendance({
            employeeId: req.user.id,
            date: today,
            checkIn: new Date(),
            status: 'Present'
        });
        await attendance.save();
        res.status(201).json({ success: true, data: attendance });
    } catch (err) {
        res.status(500).json({ error: 'Check-in failed' });
    }
};

exports.checkOut = async (req, res) => {
    try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        let attendance = await Attendance.findOne({ employeeId: req.user.id, date: today });
        if (!attendance) return res.status(404).json({ error: 'No check-in found for today' });
        if (attendance.checkOut) return res.status(400).json({ error: 'Already checked out' });

        attendance.checkOut = new Date();
        const diffMs = attendance.checkOut - attendance.checkIn;
        attendance.workingHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

        await attendance.save();
        res.status(200).json({ success: true, data: attendance });
    } catch (err) {
        res.status(500).json({ error: 'Check-out failed' });
    }
};

exports.getMyHistory = async (req, res) => {
    try {
        const history = await Attendance.find({ employeeId: req.user.id }).sort({ date: -1 });
        res.status(200).json({ data: history });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching history' });
    }
};

exports.getTeamHistory = async (req, res) => {
    try {
        const manager = await User.findById(req.user.id);
        const team = await User.find({ departmentId: manager.departmentId, roles: 'Employee' }).select('_id');
        const teamIds = team.map(t => t._id);

        const history = await Attendance.find({ employeeId: { $in: teamIds } }).sort({ date: -1 }).populate('employeeId', 'name designation');
        res.status(200).json({ data: history });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching team history' });
    }
};

exports.getAll = async (req, res) => {
    try {
        const history = await Attendance.find().sort({ date: -1 }).populate('employeeId', 'name designation departmentId');
        res.status(200).json({ data: history });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching all history' });
    }
};
