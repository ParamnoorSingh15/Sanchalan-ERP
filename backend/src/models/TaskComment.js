const mongoose = require('mongoose');

const taskCommentSchema = new mongoose.Schema({
    linkedTaskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    commentText: {
        type: String,
        required: true
    },
    commentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

taskCommentSchema.index({ linkedTaskId: 1, createdAt: 1 });

module.exports = mongoose.model('TaskComment', taskCommentSchema);
