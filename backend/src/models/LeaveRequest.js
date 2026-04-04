const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    leaveType: {
        type: String,
        enum: ['Sick', 'Casual', 'Annual', 'Maternity/Paternity', 'Unpaid'],
        required: true
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
        default: 'Pending'
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
