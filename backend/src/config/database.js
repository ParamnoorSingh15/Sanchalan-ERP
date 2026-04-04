const mongoose = require('mongoose');

const connect = async () => {
    const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/sanchalan';
    await mongoose.connect(MONGO_URL);
    console.log('[DB] Connected to MongoDB');
};

module.exports = { connect };
