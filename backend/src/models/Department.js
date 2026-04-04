const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    departmentName: { type: String, required: true, unique: true, index: true },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    description: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema);
