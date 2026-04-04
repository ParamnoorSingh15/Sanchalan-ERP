const mongoose = require('mongoose');

const performanceLogSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    productivityScore: { type: Number, min: 0, max: 100 },
    reviewPeriod: { type: String, required: true },
    tasksCompleted: { type: Number },
    comments: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('PerformanceLog', performanceLogSchema);
