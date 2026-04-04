const express = require('express');
const router = express.Router();
const leaveCtrl = require('./leave.controller');
const { authenticateJWT, authorizeRoles } = require('../../middleware/auth');

router.use(authenticateJWT);
router.post('/request', authorizeRoles('Employee', 'Manager'), leaveCtrl.requestLeave);
router.put('/:id/approve', authorizeRoles('Manager', 'Admin'), leaveCtrl.approveLeave);
router.put('/:id/reject', authorizeRoles('Manager', 'Admin'), leaveCtrl.rejectLeave);
router.get('/my-requests', authorizeRoles('Employee', 'Manager'), leaveCtrl.getMyRequests);
router.get('/team-requests', authorizeRoles('Manager'), leaveCtrl.getTeamRequests);
router.get('/all', authorizeRoles('Admin'), leaveCtrl.getAll);

module.exports = router;
