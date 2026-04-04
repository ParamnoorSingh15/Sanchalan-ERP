const express = require('express');
const router = express.Router();
const departmentsController = require('./departments.controller');
const { authenticateJWT, authorizeRoles } = require('../../middleware/auth');

router.use(authenticateJWT);

router.post('/create', authorizeRoles('Admin'), departmentsController.createDepartment);
router.get('/', authorizeRoles('Admin', 'Manager', 'Employee'), departmentsController.getDepartments);
router.put('/:id/update', authorizeRoles('Admin'), departmentsController.updateDepartment);
router.delete('/:id/remove', authorizeRoles('Admin'), departmentsController.deleteDepartment);

module.exports = router;
