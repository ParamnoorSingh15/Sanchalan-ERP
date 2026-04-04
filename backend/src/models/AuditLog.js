const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    action: {
        type: String,
        enum: [
            'LOGIN_SUCCESS', 'LOGIN_FAILURE', 'LOGOUT',
            'PASSWORD_RESET_REQUEST', 'PASSWORD_RESET_COMPLETE',
            'ROLE_UPDATE', 'USER_CREATED', 'USER_DEACTIVATED',
            'TOKEN_REFRESH'
        ],
        required: true
    },
    details: {
        ip: { type: String },
        userAgent: { type: String },
        extra: { type: mongoose.Schema.Types.Mixed }
    },
    timestamp: { type: Date, default: Date.now }
});

auditLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
