const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    taskTitle: {
        type: String,
        required: true,
        trim: true
    },
    taskDescription: {
        type: String
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['Pending', 'Assigned', 'In Progress', 'Blocked', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    startDate: {
        type: Date
    },
    dueDate: {
        type: Date,
        required: true
    },
    completedAt: {
        type: Date
    },
    estimatedHours: {
        type: Number
    },
    actualHours: {
        type: Number,
        default: 0
    },
    attachments: [{
        url: String,
        filename: String,
        uploadedAt: { type: Date, default: Date.now }
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TaskComment'
    }]
}, {
    timestamps: true
});

taskSchema.index({ departmentId: 1, status: 1 });
taskSchema.index({ assignedTo: 1, dueDate: 1 });

module.exports = mongoose.model('Task', taskSchema);
