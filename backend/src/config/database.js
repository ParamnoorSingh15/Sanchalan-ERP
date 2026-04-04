const mongoose = require('mongoose');

// Cache connection across serverless invocations (Vercel cold-start fix)
let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connect = async () => {
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/sanchalan';
        cached.promise = mongoose.connect(MONGO_URL, {
            serverSelectionTimeoutMS: 10000,
            bufferCommands: false,
        }).then((m) => {
            console.log('[DB] Connected to MongoDB');
            return m;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
};

module.exports = { connect };
