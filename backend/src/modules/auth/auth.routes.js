const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { authenticateJWT, authorizeRoles } = require('../../middleware/auth');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

// ─── Rate limiting ─────────────────────────────────────────────────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { error: 'Too many requests. Try again later.', code: 'TOO_MANY_REQUESTS' },
    standardHeaders: true,  // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,
});

// ─── Input validation middleware ───────────────────────────────────────────
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation Error', errors: errors.array(), code: 'BAD_REQUEST' });
    }
    next();
};

// ─── Routes ───────────────────────────────────────────────────────────────

// Admin-only: register new user
router.post(
    '/register',
    authLimiter,
    authenticateJWT,
    authorizeRoles('Admin'),
    [
        body('name').notEmpty().trim().withMessage('Name is required'),
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('role').optional().isIn(['Admin', 'Manager', 'Employee']).withMessage('Invalid role'),
    ],
    validate,
    authController.register
);

// Public: login
router.post(
    '/login',
    authLimiter,
    [
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    validate,
    authController.login
);

// Public: forgot password
router.post(
    '/forgot-password',
    authLimiter,
    [body('email').isEmail().normalizeEmail().withMessage('Valid email is required')],
    validate,
    authController.forgotPassword
);

// Public: reset password
router.post(
    '/reset-password',
    authLimiter,
    [
        body('token').notEmpty().withMessage('Token is required'),
        body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ],
    validate,
    authController.resetPassword
);

// Public: refresh access token using httpOnly cookie
router.post('/refresh', authController.refresh);

// Authenticated: logout
router.post('/logout', authenticateJWT, authController.logout);

module.exports = router;
