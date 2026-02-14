const RoleModel = require('../models/roleModel');
const { logAction } = require('../controllers/auditLog.controller');

exports.getAllRoles = async (req, res) => {
    try {
        const roles = await RoleModel.getAll();
        // Frontend expects { roles: [] }
        res.json({ roles });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRoleById = async (req, res) => {
    try {
        const role = await RoleModel.getById(parseInt(req.params.id));
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        res.json(role);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createRole = async (req, res) => {
    try {
        const { name, description, permissions } = req.body;

        // Validation handled by Model or DB constraint (name unique)
        const newRole = await RoleModel.create({ name, description, permissions });

        // Audit Log
        if (req.user) {
            logAction(req.user.userId, req.user.email, 'Create', 'Roles', `Created role ${name}`, req);
        }

        res.status(201).json(newRole);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateRole = async (req, res) => {
    try {
        const roleId = parseInt(req.params.id);
        const updatedRole = await RoleModel.update(roleId, req.body);

        if (!updatedRole) {
            return res.status(404).json({ message: 'Role not found' });
        }

        // Audit Log
        if (req.user) {
            logAction(req.user.userId, req.user.email, 'Update', 'Roles', `Updated role ID ${roleId}`, req);
        }

        res.json(updatedRole);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteRole = async (req, res) => {
    try {
        const roleId = parseInt(req.params.id);
        await RoleModel.delete(roleId);

        // Audit Log
        if (req.user) {
            logAction(req.user.userId, req.user.email, 'Delete', 'Roles', `Deleted role ID ${roleId}`, req);
        }

        res.json({ message: 'Role deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
