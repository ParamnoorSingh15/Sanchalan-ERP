const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    roles: {
        type: [String],
        enum: ['Admin', 'Manager', 'Employee'],
        default: ['Employee']
    },
    employeeId: { type: String, unique: true, sparse: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    designation: { type: String },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: ['Active', 'On Leave', 'Terminated', 'Suspended'],
        default: 'Active'
    },
    joiningDate: { type: Date },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    mfaSecret: { type: String, default: null },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true // adds createdAt and updatedAt
});

module.exports = mongoose.model('User', userSchema);
