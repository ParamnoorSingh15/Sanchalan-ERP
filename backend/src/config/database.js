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
        }).then((m) => {
            console.log('[DB] Connected to MongoDB');
            return m;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
};

// Middleware: ensures DB is connected before any route handler runs
const dbMiddleware = async (req, res, next) => {
    try {
        await connect();
        next();
    } catch (err) {
        console.error('[DB] Connection failed in middleware:', err.message);
        res.status(503).json({ error: 'Database unavailable', code: '503' });
    }
};

module.exports = { connect, dbMiddleware };
