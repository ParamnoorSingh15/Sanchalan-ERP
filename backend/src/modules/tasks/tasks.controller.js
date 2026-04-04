const Task = require('../../models/Task');
const TaskComment = require('../../models/TaskComment');
const User = require('../../models/User');
const { createAuditLog } = require('../../core/auditLogger');

/**
 * POST /api/tasks/create
 * Admin, Manager: Create a task
 */
exports.createTask = async (req, res) => {
    try {
        const { taskTitle, taskDescription, assignedTo, dueDate, priority, estimatedHours } = req.body;
        if (!taskTitle || !dueDate) return res.status(400).json({ error: 'Title and Due Date are required' });

        const author = await User.findById(req.user.id);
        if (!author || (!author.roles.includes('Admin') && !author.departmentId)) {
            return res.status(403).json({ error: 'Cannot determine department context' });
        }

        const task = new Task({
            taskTitle,
            taskDescription,
            assignedTo: assignedTo || undefined,
            assignedBy: author._id,
            departmentId: author.departmentId || req.body.departmentId, // Admin might provide a specific departmentId
            priority: priority || 'Medium',
            dueDate,
            estimatedHours,
            status: assignedTo ? 'Assigned' : 'Pending'
        });

        await task.save();
        await createAuditLog(req.user.id, 'TASK_CREATED', req, { taskId: task._id });

        res.status(201).json({ success: true, data: task });
    } catch (err) {
        console.error('[Tasks] create error:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * GET /api/tasks
 * Admin sees all. Manager sees their department. Employee sees assigned to them.
 */
exports.getTasks = async (req, res) => {
    try {
        let query = {};
        if (req.user.roles.includes('Admin')) {
            // Can see all
        } else if (req.user.roles.includes('Manager')) {
            const manager = await User.findById(req.user.id);
            query.departmentId = manager.departmentId;
        } else {
            query.assignedTo = req.user.id;
        }

        const tasks = await Task.find(query)
            .populate('assignedTo', 'name email designation')
            .populate('assignedBy', 'name email')
            .populate('departmentId', 'departmentName')
            .sort({ priority: -1, dueDate: 1 })
            .lean();

        res.status(200).json({ data: tasks });
    } catch (err) {
        console.error('[Tasks] getTasks error:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * GET /api/tasks/:id
 */
exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignedTo', 'name email designation')
            .populate('assignedBy', 'name email')
            .populate('departmentId', 'departmentName')
            .populate({
                path: 'comments',
                populate: { path: 'commentBy', select: 'name roles' }
            });

        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.status(200).json(task);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * PUT /api/tasks/:id/update
 * Admin/Manager updates core details
 */
exports.updateTask = async (req, res) => {
    try {
        const { taskTitle, taskDescription, dueDate, priority, estimatedHours } = req.body;
        const task = await Task.findByIdAndUpdate(req.params.id, {
            taskTitle, taskDescription, dueDate, priority, estimatedHours
        }, { new: true });

        if (!task) return res.status(404).json({ error: 'Task not found' });

        await createAuditLog(req.user.id, 'TASK_UPDATED', req, { taskId: task._id });
        res.status(200).json({ success: true, data: task });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * DELETE /api/tasks/:id
 * Admin only
 */
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ error: 'Task not found' });

        await TaskComment.deleteMany({ linkedTaskId: task._id });
        await createAuditLog(req.user.id, 'TASK_DELETED', req, { taskId: task._id });
        res.status(200).json({ success: true, message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ============================
// STATUS UPDATE CONTROLLERS
// ============================

exports.startTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, {
            status: 'In Progress',
            startDate: new Date()
        }, { new: true });
        await createAuditLog(req.user.id, 'TASK_STARTED', req, { taskId: task._id });
        res.status(200).json({ data: task });
    } catch (err) { res.status(500).json({ error: 'Error starting task' }); }
};

exports.progressTask = async (req, res) => {
    try {
        const { hoursLogged } = req.body;
        const task = await Task.findByIdAndUpdate(req.params.id, {
            $inc: { actualHours: Number(hoursLogged) || 0 }
        }, { new: true });
        res.status(200).json({ data: task });
    } catch (err) { res.status(500).json({ error: 'Error logging hours' }); }
};

exports.completeTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, {
            status: 'Completed',
            completedAt: new Date()
        }, { new: true });
        await createAuditLog(req.user.id, 'TASK_COMPLETED', req, { taskId: task._id });
        res.status(200).json({ data: task });
    } catch (err) { res.status(500).json({ error: 'Error completing task' }); }
};

exports.blockTask = async (req, res) => {
    try {
        const { reason } = req.body;
        const task = await Task.findByIdAndUpdate(req.params.id, { status: 'Blocked' }, { new: true });

        // Auto-comment the block reason
        if (reason) {
            const comment = new TaskComment({ linkedTaskId: task._id, commentText: `🔒 BLOCKED: ${reason}`, commentBy: req.user.id });
            await comment.save();
            task.comments.push(comment._id);
            await task.save();
        }

        await createAuditLog(req.user.id, 'TASK_BLOCKED', req, { taskId: task._id, reason });
        res.status(200).json({ data: task });
    } catch (err) { res.status(500).json({ error: 'Error blocking task' }); }
};

exports.reassignTask = async (req, res) => {
    try {
        const { newAssigneeId } = req.body;
        const task = await Task.findByIdAndUpdate(req.params.id, {
            assignedTo: newAssigneeId || undefined,
            status: newAssigneeId ? 'Assigned' : 'Pending'
        }, { new: true });
        await createAuditLog(req.user.id, 'TASK_REASSIGNED', req, { taskId: task._id, newAssigneeId });
        res.status(200).json({ data: task });
    } catch (err) { res.status(500).json({ error: 'Error reassigning task' }); }
};

// ============================
// COMMENTS API
// ============================

exports.addComment = async (req, res) => {
    try {
        const { commentText } = req.body;
        if (!commentText) return res.status(400).json({ error: 'Comment required' });

        const comment = new TaskComment({
            linkedTaskId: req.params.id,
            commentText,
            commentBy: req.user.id
        });
        await comment.save();

        await Task.findByIdAndUpdate(req.params.id, { $push: { comments: comment._id } });
        res.status(201).json({ data: comment });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add comment' });
    }
};

// ============================
// ATTACHMENTS API
// ============================

exports.uploadAttachment = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const attachment = {
            url: `/uploads/tasks/${req.file.filename}`,
            filename: req.file.originalname,
            uploadedAt: new Date()
        };

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { $push: { attachments: attachment } },
            { new: true }
        );

        res.status(200).json({ success: true, data: attachment });
    } catch (err) {
        res.status(500).json({ error: 'Failed to upload attachment' });
    }
};
