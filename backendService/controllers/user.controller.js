const UserModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const { logAction } = require('../controllers/auditLog.controller');

exports.getAllUsers = async (req, res) => {
    try {
        // Model returns camelCase
        const users = await UserModel.getAll();
        res.json({ users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        // Model returns camelCase
        const user = await UserModel.getById(parseInt(req.params.id));
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.createUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Check exists
        const existing = await UserModel.getByEmail(email);
        if (existing) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await UserModel.create({
            ...req.body,
            password: hashedPassword
        });

        // Audit Log
        if (req.user) {
            logAction(req.user.userId, req.user.email, 'Create', 'Users', `Created user ${newUser.username}`, req);
        }

        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const updates = req.body;

        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        const updatedUser = await UserModel.update(userId, updates);

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Audit Log
        if (req.user) {
            logAction(req.user.userId, req.user.email, 'Update', 'Users', `Updated user ID ${userId}`, req);
        }

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const deleted = await UserModel.delete(userId);

        if (!deleted) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Audit Log
        if (req.user) {
            logAction(req.user.userId, req.user.email, 'Delete', 'Users', `Deleted user ID ${userId}`, req);
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
