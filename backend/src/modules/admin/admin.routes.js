const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { authenticateJWT, authorizeRoles } = require('../../middleware/auth');

router.use(authenticateJWT);
router.use(authorizeRoles('Admin'));

router.get('/stats', adminController.getStats);
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
