require('./config/env'); // load and validate env vars first
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config/env');
const { dbMiddleware } = require('./config/database');

const app = express();

// ─── Security middleware ────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
    origin: config.frontendOrigin,
    credentials: true,
}));

// ─── Body parsing ───────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── Ensure DB is connected before all routes ───────────────────────────────
app.use(dbMiddleware);

// ─── Module routes ─────────────────────────────────────────────────────────
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/users', require('./modules/users/users.routes'));
app.use('/api/admin', require('./modules/admin/admin.routes'));
app.use('/api/employees', require('./modules/employees/employees.routes'));
app.use('/api/departments', require('./modules/departments/departments.routes'));
app.use('/api/attendance', require('./modules/attendance/attendance.routes'));
app.use('/api/leave', require('./modules/leave/leave.routes'));
app.use('/api/performance', require('./modules/performance/performance.routes'));
app.use('/api/tasks', require('./modules/tasks/tasks.routes'));

// ─── Health check ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', env: config.nodeEnv });
});

// ─── 404 handler ────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ error: 'Not Found', code: '404' });
});

// ─── Global error handler ────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
    console.error('[Server Error]', err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        code: String(err.status || '500'),
    });
});

module.exports = app;
