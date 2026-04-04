const express = require('express');
const router = express.Router();
const attendanceCtrl = require('./attendance.controller');
const { authenticateJWT, authorizeRoles } = require('../../middleware/auth');

router.use(authenticateJWT);
router.post('/check-in', authorizeRoles('Employee', 'Manager'), attendanceCtrl.checkIn);
router.post('/check-out', authorizeRoles('Employee', 'Manager'), attendanceCtrl.checkOut);
router.get('/my-history', authorizeRoles('Employee', 'Manager'), attendanceCtrl.getMyHistory);
router.get('/team-history', authorizeRoles('Manager'), attendanceCtrl.getTeamHistory);
router.get('/all', authorizeRoles('Admin'), attendanceCtrl.getAll);

module.exports = router;
