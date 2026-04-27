const express = require('express');
const { authenticateJWT, authorizeRoles } = require('../../middleware/auth');
const notificationsCtrl = require('./notifications.controller');

const router = express.Router();

router.use(authenticateJWT);

router.get('/', notificationsCtrl.getUserNotifications);
router.put('/read-all', notificationsCtrl.markAllAsRead);
router.put('/:id/read', notificationsCtrl.markAsRead);

// Allow admins to create notifications manually 
router.post('/', authorizeRoles('Admin'), notificationsCtrl.createNotification);

module.exports = router;
