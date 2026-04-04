const User = require('../../models/User');
const RefreshToken = require('../../models/RefreshToken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { generateAccessToken } = require('../../utils/jwt');
const { createAuditLog } = require('../../core/auditLogger');

const REFRESH_TOKEN_EXPIRY_DAYS = 7;

/**
 * POST /api/auth/register
 * Admin-only: creates a new user account.
 */
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered', code: 'CONFLICT' });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const validRoles = ['Admin', 'Manager', 'Employee'];
        const roles = validRoles.includes(role) ? [role] : ['Employee'];

        const newUser = await User.create({ name, email, passwordHash, roles });

        await createAuditLog(newUser._id, 'USER_CREATED', req, { roles });

        res.status(201).json({ message: 'User created successfully', data: { id: newUser._id } });
    } catch (err) {
        console.error('[Auth] register error:', err.message);
        res.status(500).json({ error: 'Internal Server Error', code: '500' });
    }
};

/**
 * POST /api/auth/login
 * Validates credentials, issues access + refresh tokens.
 */
exports.login = async (req, res) => {
    try {
        const email = req.body.email?.trim();
        const password = req.body.password;

        const user = await User.findOne({ email });
        if (!user) {
            // Generic message to avoid leaking user enumeration
            return res.status(401).json({ error: 'Invalid credentials', code: 'UNAUTHORIZED' });
        }

        if (user.lockUntil && user.lockUntil > Date.now()) {
            return res.status(423).json({ error: 'Account locked. Try again later.', code: 'LOCKED' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);

        if (!isMatch) {
            user.failedLoginAttempts += 1;
            if (user.failedLoginAttempts >= 5) {
                user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 min lockout
            }
            await user.save();
            await createAuditLog(user._id, 'LOGIN_FAILURE', req);
            return res.status(401).json({ error: 'Invalid credentials', code: 'UNAUTHORIZED' });
        }

        // Reset failed attempts on success
        user.failedLoginAttempts = 0;
        user.lockUntil = null;
        await user.save();

        const accessToken = generateAccessToken(user);
        const refreshTokenValue = crypto.randomUUID();

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

        await RefreshToken.create({ userId: user._id, token: refreshTokenValue, expiresAt });
        await createAuditLog(user._id, 'LOGIN_SUCCESS', req);

        res.cookie('refreshToken', refreshTokenValue, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({ accessToken });
    } catch (err) {
        console.error('[Auth] login error:', err.message);
        res.status(500).json({ error: 'Internal Server Error', code: '500' });
    }
};

/**
 * POST /api/auth/refresh
 * Uses the httpOnly refreshToken cookie to issue a new access token.
 */
exports.refresh = async (req, res) => {
    try {
        // Use cookie-parser compatible access (cookie-parser adds req.cookies)
        // Fallback: manually parse from header for robustness
        const token = req.cookies?.refreshToken ?? parseCookieHeader(req.headers.cookie, 'refreshToken');

        if (!token) {
            return res.status(401).json({ error: 'Refresh token missing', code: 'UNAUTHORIZED' });
        }

        const tokenDoc = await RefreshToken.findOne({ token }).populate('userId');

        if (!tokenDoc) {
            return res.status(401).json({ error: 'Invalid refresh token', code: 'UNAUTHORIZED' });
        }
        if (tokenDoc.revoked) {
            return res.status(401).json({ error: 'Refresh token has been revoked', code: 'UNAUTHORIZED' });
        }
        if (tokenDoc.expiresAt < Date.now()) {
            return res.status(401).json({ error: 'Refresh token expired', code: 'UNAUTHORIZED' });
        }

        const newAccessToken = generateAccessToken(tokenDoc.userId);
        await createAuditLog(tokenDoc.userId._id, 'TOKEN_REFRESH', req);

        res.status(200).json({ accessToken: newAccessToken });
    } catch (err) {
        console.error('[Auth] refresh error:', err.message);
        res.status(500).json({ error: 'Internal Server Error', code: '500' });
    }
};

/**
 * POST /api/auth/logout
 * Revokes the refresh token and clears the cookie.
 */
exports.logout = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken ?? parseCookieHeader(req.headers.cookie, 'refreshToken');

        if (token) {
            await RefreshToken.updateOne({ token }, { revoked: true });
            const tokenDoc = await RefreshToken.findOne({ token });
            if (tokenDoc) {
                await createAuditLog(tokenDoc.userId, 'LOGOUT', req);
            }
        }

        res.clearCookie('refreshToken');
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error('[Auth] logout error:', err.message);
        res.status(500).json({ error: 'Internal Server Error', code: '500' });
    }
};

/**
 * POST /api/auth/forgot-password
 * Generates a reset token and sends it via email mock.
 */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            // Do not leak user existence. Still return success.
            return res.status(200).json({ message: 'If that email is registered, a password reset link has been sent.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save();

        await createAuditLog(user._id, 'PASSWORD_RESET_REQUEST', req);

        // MOCK EMAIL SENDING
        console.log(`\n\n[MOCK EMAIL] To: ${email}`);
        console.log(`[MOCK EMAIL] Subject: Password Reset`);
        console.log(`[MOCK EMAIL] Link: http://localhost:3000/reset-password?token=${resetToken}\n\n`);

        res.status(200).json({ message: 'If that email is registered, a password reset link has been sent.' });
    } catch (err) {
        console.error('[Auth] forgot password error:', err.message);
        res.status(500).json({ error: 'Internal Server Error', code: '500' });
    }
};

/**
 * POST /api/auth/reset-password
 * Resets the user's password using a valid token.
 */
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetToken: hashedToken,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Token is invalid or has expired', code: 'BAD_REQUEST' });
        }

        user.passwordHash = await bcrypt.hash(newPassword, 12);
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        // Also unlock the account if it was locked
        user.failedLoginAttempts = 0;
        user.lockUntil = null;
        await user.save();

        await createAuditLog(user._id, 'PASSWORD_RESET_COMPLETE', req);

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (err) {
        console.error('[Auth] reset password error:', err.message);
        res.status(500).json({ error: 'Internal Server Error', code: '500' });
    }
};

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Safely parses a named cookie from the raw Cookie header string.
 * Handles URL-encoded values and safely ignores malformed pairs.
 */
function parseCookieHeader(cookieHeader, name) {
    if (!cookieHeader) return null;
    const pair = cookieHeader
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith(`${name}=`));
    return pair ? decodeURIComponent(pair.slice(name.length + 1)) : null;
}
