require('dotenv').config();
const app = require('./app');
const { connect } = require('./config/database');
const config = require('./config/env');

let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        await connect();
        isConnected = true;
        console.log('[Server] Connected to MongoDB');
    } catch (err) {
        console.error('[Server] DB Connection Failed:', err.message);
    }
};

if (!process.env.VERCEL) {
    const start = async () => {
        try {
            await connectDB();
            app.listen(config.port, () => {
                console.log(`[Server] Listening on port ${config.port} (${config.nodeEnv})`);
            });
        } catch (err) {
            console.error('[Server] Failed to start:', err.message);
            process.exit(1);
        }
    };
    start();
} else {
    // Vercel Serverless environment: Mongoose queues requests until connected
    connectDB();
}

module.exports = app;
