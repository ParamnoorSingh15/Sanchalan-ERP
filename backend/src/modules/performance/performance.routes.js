const express = require('express');
const router = express.Router();
const perfCtrl = require('./performance.controller');
const { authenticateJWT, authorizeRoles } = require('../../middleware/auth');

router.use(authenticateJWT);
router.post('/add-review', authorizeRoles('Manager', 'Admin'), perfCtrl.addReview);
router.get('/my-reviews', authorizeRoles('Employee', 'Manager'), perfCtrl.getMyReviews);
router.get('/team-reviews', authorizeRoles('Manager'), perfCtrl.getTeamReviews);
router.get('/all', authorizeRoles('Admin'), perfCtrl.getAll);

module.exports = router;
