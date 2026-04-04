const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Generates a short-lived access token (JWT) for a user.
 * @param {Object} user - Mongoose User document
 * @returns {string} Signed JWT access token
 */
const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, roles: user.roles, email: user.email },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
    );
};

/**
 * Verifies a JWT access token and returns the decoded payload.
 * Returns null if the token is invalid or expired.
 * @param {string} token
 * @returns {Object|null}
 */
const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, config.jwt.secret);
    } catch {
        return null;
    }
};

module.exports = { generateAccessToken, verifyAccessToken };
