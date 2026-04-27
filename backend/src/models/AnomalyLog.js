const mongoose = require('mongoose');

const anomalyLogSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    role: { type: String },
    department: { type: String },
    action: { type: String },
    resource: { type: String },
    anomaly_score: { type: Number },
    severity: { type: String },
    reason: { type: String },
    requires_escalation: { type: Boolean, default: false },
    visualization_hint: { type: String },
    timestamp: { type: Date, default: Date.now }
});

anomalyLogSchema.index({ timestamp: -1 });
anomalyLogSchema.index({ user_id: 1 });

module.exports = mongoose.model('AnomalyLog', anomalyLogSchema);
