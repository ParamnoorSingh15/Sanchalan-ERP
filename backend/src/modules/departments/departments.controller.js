const Department = require('../../models/Department');
const User = require('../../models/User');

exports.createDepartment = async (req, res) => {
    try {
        const { departmentName, managerId, description } = req.body;
        const newDept = new Department({ departmentName, managerId, description });
        await newDept.save();
        res.status(201).json({ success: true, data: newDept });
    } catch (err) {
        res.status(500).json({ error: 'Error creating department' });
    }
};

exports.getDepartments = async (req, res) => {
    try {
        let query = {};
        if (req.user.roles.includes('Employee')) {
            const currentUser = await User.findById(req.user.id);
            if (currentUser && currentUser.departmentId) {
                query._id = currentUser.departmentId;
            }
        }
        const departments = await Department.find(query);
        res.status(200).json({ data: departments });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching departments' });
    }
};

exports.updateDepartment = async (req, res) => {
    try {
        const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ message: 'Department updated', data: dept });
    } catch (err) {
        res.status(500).json({ error: 'Error updating department' });
    }
};

exports.deleteDepartment = async (req, res) => {
    try {
        await Department.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Department deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting department' });
    }
};
