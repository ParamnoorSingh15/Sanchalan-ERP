const User = require('../../models/User');

exports.getEmployees = async (req, res) => {
    try {
        let query = { roles: 'Employee' };
        if (req.user.roles.includes('Manager')) {
            const manager = await User.findById(req.user.id);
            if (manager && manager.departmentId) {
                query.departmentId = manager.departmentId;
            } else {
                return res.status(403).json({ error: 'Manager has no department assigned' });
            }
        }
        const employees = await User.find(query).select('-passwordHash').populate('departmentId', 'departmentName');
        res.status(200).json({ data: employees });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getEmployeeById = async (req, res) => {
    try {
        const employee = await User.findById(req.params.id).select('-passwordHash');
        if (!employee || !employee.roles.includes('Employee')) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.status(200).json(employee);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        const { designation, departmentId } = req.body;
        const employee = await User.findByIdAndUpdate(req.params.id, { designation, departmentId }, { new: true }).select('-passwordHash');
        res.status(200).json({ message: 'Employee updated', data: employee });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { isActive: false });
        res.status(200).json({ message: 'Employee deactivated' });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
