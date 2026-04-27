const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    body: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'danger', 'success', 'muted'],
        default: 'info'
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index to quickly fetch a user's unread notifications
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
