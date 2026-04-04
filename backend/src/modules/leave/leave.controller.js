const LeaveRequest = require('../../models/LeaveRequest');
const User = require('../../models/User');

exports.requestLeave = async (req, res) => {
    try {
        const leave = new LeaveRequest({
            ...req.body,
            employeeId: req.user.id,
            status: 'Pending'
        });
        await leave.save();
        res.status(201).json({ success: true, data: leave });
    } catch (err) {
        res.status(500).json({ error: 'Error requesting leave' });
    }
};

exports.approveLeave = async (req, res) => {
    try {
        const leave = await LeaveRequest.findByIdAndUpdate(req.params.id, {
            status: 'Approved',
            approvedBy: req.user.id
        }, { new: true });
        res.status(200).json({ success: true, data: leave });
    } catch (err) {
        res.status(500).json({ error: 'Error approving leave' });
    }
};

exports.rejectLeave = async (req, res) => {
    try {
        const leave = await LeaveRequest.findByIdAndUpdate(req.params.id, {
            status: 'Rejected',
            approvedBy: req.user.id
        }, { new: true });
        res.status(200).json({ success: true, data: leave });
    } catch (err) {
        res.status(500).json({ error: 'Error rejecting leave' });
    }
};

exports.getMyRequests = async (req, res) => {
    try {
        const requests = await LeaveRequest.find({ employeeId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ data: requests });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching requests' });
    }
};

exports.getTeamRequests = async (req, res) => {
    try {
        const manager = await User.findById(req.user.id);
        const team = await User.find({ departmentId: manager.departmentId }).select('_id');
        const teamIds = team.map(t => t._id);
        const requests = await LeaveRequest.find({ employeeId: { $in: teamIds } }).populate('employeeId', 'name designation').sort({ createdAt: -1 });
        res.status(200).json({ data: requests });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching team requests' });
    }
};

exports.getAll = async (req, res) => {
    try {
        const requests = await LeaveRequest.find().populate('employeeId', 'name departmentId').sort({ createdAt: -1 });
        res.status(200).json({ data: requests });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching all requests' });
    }
};
