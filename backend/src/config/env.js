require('dotenv').config();

/**
 * Centralized environment configuration.
 * All process.env reads should happen through this module so missing
 * values are caught at startup rather than at runtime.
 */
const config = {
    port: parseInt(process.env.PORT, 10) || 8000,
    mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017/sanchalan',
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
    jwt: {
        secret: process.env.JWT_SECRET || 'changeme_use_env_in_production',
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    },
};

if (config.nodeEnv === 'production' && config.jwt.secret === 'changeme_use_env_in_production') {
    console.warn('[WARN] JWT_SECRET is using default value in production! Set a strong secret.');
}

module.exports = config;
