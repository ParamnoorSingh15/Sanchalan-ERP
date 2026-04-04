const User = require('../../models/User');
const { createAuditLog } = require('../../core/auditLogger');
const bcrypt = require('bcrypt');

/**
 * GET /api/users/me
 * Returns the currently authenticated user's profile.
 */
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash -mfaSecret').populate('departmentId', 'departmentName');
        if (!user) {
            return res.status(404).json({ error: 'User not found', code: 'NOT_FOUND' });
        }

        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            roles: user.roles,
            employeeId: user.employeeId,
            departmentId: user.departmentId,
            designation: user.designation,
            managerId: user.managerId,
            status: user.status,
            joiningDate: user.joiningDate,
            isActive: user.isActive,
        });
    } catch (err) {
        console.error('[Users] getMe error:', err.message);
        res.status(500).json({ error: 'Internal Server Error', code: '500' });
    }
};

/**
 * GET /api/users
 * Admin: paginated list of all users.
 */
exports.getAllUsers = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            User.find().select('-passwordHash -mfaSecret').populate('departmentId', 'departmentName').skip(skip).limit(limit).lean(),
            User.countDocuments(),
        ]);

        res.status(200).json({
            data: users,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    } catch (err) {
        console.error('[Users] getAllUsers error:', err.message);
        res.status(500).json({ error: 'Internal Server Error', code: '500' });
    }
};

/**
 * GET /api/users/:id
 * Admin: get a single user by ID.
 */
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-passwordHash -mfaSecret');
        if (!user) {
            return res.status(404).json({ error: 'User not found', code: 'NOT_FOUND' });
        }
        res.status(200).json(user);
    } catch (err) {
        console.error('[Users] getUserById error:', err.message);
        res.status(500).json({ error: 'Internal Server Error', code: '500' });
    }
};

/**
 * PUT /api/users/:id
 * Admin: update a user's roles, department or active status.
 */
exports.updateUser = async (req, res) => {
    try {
        const { roles, department, isActive } = req.body;

        const userToUpdate = await User.findById(req.params.id);
        if (!userToUpdate) {
            return res.status(404).json({ error: 'User not found', code: 'NOT_FOUND' });
        }

        const updates = {};
        if (roles !== undefined) {
            updates.roles = roles;
            await createAuditLog(req.user.id, 'ROLE_UPDATE', req, {
                targetUserId: req.params.id,
                oldRoles: userToUpdate.roles,
                newRoles: roles,
            });
        }
        if (department !== undefined) updates.department = department;
        if (isActive !== undefined) updates.isActive = isActive;

        const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-passwordHash -mfaSecret');

        res.status(200).json({ message: 'User updated successfully', data: updatedUser });
    } catch (err) {
        console.error('[Users] updateUser error:', err.message);
        res.status(500).json({ error: 'Internal Server Error', code: '500' });
    }
};

/**
 * DELETE /api/users/:id
 * Admin: soft-delete (deactivate) a user. Data is preserved for audit.
 */
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!user) {
            return res.status(404).json({ error: 'User not found', code: 'NOT_FOUND' });
        }

        await createAuditLog(req.user.id, 'USER_DEACTIVATED', req, { targetUserId: req.params.id });

        res.status(200).json({ message: 'User deactivated successfully', data: { id: user._id } });
    } catch (err) {
        console.error('[Users] deleteUser error:', err.message);
        res.status(500).json({ error: 'Internal Server Error', code: '500' });
    }
};

/**
 * POST /api/users/create-manager
 * Admin only: Create a Manager account.
 */
exports.createManager = async (req, res) => {
    try {
        const { name, email, password, departmentId } = req.body;
        if (!name || !email || !password) return res.status(400).json({ error: 'Missing required fields' });

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Email already exists' });

        const passwordHash = await bcrypt.hash(password, 12);
        const manager = new User({
            name, email, passwordHash, roles: ['Manager'], departmentId: departmentId || undefined, isActive: true
        });
        await manager.save();

        await createAuditLog(req.user.id, 'CREATED_MANAGER', req, { targetUserId: manager._id });

        const managerResponse = manager.toObject();
        delete managerResponse.passwordHash;

        res.status(201).json({ success: true, data: managerResponse });
    } catch (err) {
        console.error('[Users] createManager error:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * POST /api/users/create-employee
 * Admin, Manager: Create an Employee account under the caller's department.
 */
exports.createEmployee = async (req, res) => {
    try {
        const { name, email, password, departmentId, managerId, designation, employeeId, joiningDate } = req.body;
        if (!name || !email || !password) return res.status(400).json({ error: 'Missing required fields' });

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Email already exists' });

        const passwordHash = await bcrypt.hash(password, 12);
        const employee = new User({
            name, email, passwordHash, roles: ['Employee'], departmentId: departmentId || undefined, managerId: managerId || undefined, designation, employeeId, joiningDate, isActive: true
        });
        await employee.save();

        await createAuditLog(req.user.id, 'CREATED_EMPLOYEE', req, { targetUserId: employee._id });

        const employeeResponse = employee.toObject();
        delete employeeResponse.passwordHash;

        res.status(201).json({ success: true, data: employeeResponse });
    } catch (err) {
        console.error('[Users] createEmployee error:', err.message);
        res.status(500).json({ error: err.message.includes('validation') ? err.message : 'Internal Server Error' });
    }
};
