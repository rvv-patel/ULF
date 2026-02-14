const PermissionModel = require('../models/permissionModel');

exports.getAllPermissions = async (req, res) => {
    try {
        const permissions = await PermissionModel.getAll();
        res.json({ permissions }); // Frontend expects { permissions: [] }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
