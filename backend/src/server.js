require('dotenv').config();
const app = require('./app');
const { connect } = require('./config/database');
const config = require('./config/env');

const start = async () => {
    try {
        await connect();
        app.listen(config.port, () => {
            console.log(`[Server] Listening on port ${config.port} (${config.nodeEnv})`);
        });
    } catch (err) {
        console.error('[Server] Failed to start:', err.message);
        process.exit(1);
    }
};

start();
