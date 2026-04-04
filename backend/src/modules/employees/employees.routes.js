const express = require('express');
const router = express.Router();
const employeesController = require('./employees.controller');
const { authenticateJWT, authorizeRoles, checkManagerScope } = require('../../middleware/auth');
const usersController = require('../users/users.controller');

router.use(authenticateJWT);

router.post('/create', authorizeRoles('Admin', 'Manager'), checkManagerScope, usersController.createEmployee);
router.get('/', authorizeRoles('Admin', 'Manager'), employeesController.getEmployees);
router.get('/:id', authorizeRoles('Admin', 'Manager', 'Employee'), employeesController.getEmployeeById);
router.put('/:id/update', authorizeRoles('Admin', 'Manager'), employeesController.updateEmployee);
router.delete('/:id/remove', authorizeRoles('Admin'), employeesController.deleteEmployee);

module.exports = router;
