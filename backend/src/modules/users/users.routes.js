const express = require('express');
const router = express.Router();
const usersController = require('./users.controller');
const { authenticateJWT, authorizeRoles, checkManagerScope } = require('../../middleware/auth');

// All user routes require authentication
router.use(authenticateJWT);

// Role Creation Workflow
router.post('/create-manager', authorizeRoles('Admin'), usersController.createManager);
router.post('/create-employee', authorizeRoles('Admin', 'Manager'), checkManagerScope, usersController.createEmployee);

// Authenticated user – get own profile
router.get('/me', usersController.getMe);

// Admin-only routes
router.use(authorizeRoles('Admin'));
router.get('/', usersController.getAllUsers);
router.get('/:id', usersController.getUserById);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);

module.exports = router;
