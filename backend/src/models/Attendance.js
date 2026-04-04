const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date },
    workingHours: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Half-Day', 'Late'],
        default: 'Present'
    }
}, {
    timestamps: true
});

attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: -1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
