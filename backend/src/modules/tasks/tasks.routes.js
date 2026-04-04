const express = require('express');
const router = express.Router();
const tasksController = require('./tasks.controller');
const { authenticateJWT, authorizeRoles } = require('../../middleware/auth');

router.use(authenticateJWT);

// CRUD
router.post('/create', authorizeRoles('Admin', 'Manager'), tasksController.createTask);
router.get('/', tasksController.getTasks); // Access dynamically scoped inside controller
router.get('/:id', tasksController.getTaskById);
router.put('/:id/update', authorizeRoles('Admin', 'Manager'), tasksController.updateTask);
router.delete('/:id', authorizeRoles('Admin'), tasksController.deleteTask);

// Status Flow
router.put('/:id/start', tasksController.startTask);
router.put('/:id/progress', tasksController.progressTask);
router.put('/:id/complete', tasksController.completeTask);
router.put('/:id/block', tasksController.blockTask);
router.put('/:id/reassign', authorizeRoles('Admin', 'Manager'), tasksController.reassignTask);

const upload = require('../../middleware/upload');

// Comments
router.post('/:id/comments', tasksController.addComment);

// Attachments
router.post('/:id/upload', upload.single('file'), tasksController.uploadAttachment);

module.exports = router;
