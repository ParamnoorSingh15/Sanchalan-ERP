const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: { type: String, required: true, index: true },
    issuedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    revoked: { type: Boolean, default: false }
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
