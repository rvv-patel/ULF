const UserModel = require('../models/userModel');
const RoleModel = require('../models/roleModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logAction } = require('../controllers/auditLog.controller');

const generateToken = (user) => {
    // user.role is now roleName from Model join
    return jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'super_secret_key_12345',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
};

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Exists check
        const existingEmail = await UserModel.getByEmail(email);
        if (existingEmail) return res.status(400).json({ message: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await UserModel.create({
            username,
            email,
            password: hashedPassword,
            role: 'user', // Default role
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            status: 'active'
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        console.log('[LOGIN] Received login request:', { email: req.body.email });

        const { email, password } = req.body;

        const user = await UserModel.getByEmail(email);
        if (!user) {
            console.log('[LOGIN] User not found for email:', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log('[LOGIN] User found:', { id: user.id, email: user.email, status: user.status });

        if (user.status !== 'active') {
            return res.status(403).json({ message: 'Account is inactive' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log('[LOGIN] Password matched, generating token');

        // Get Permissions
        // User permissions now come from Role in DB. 
        // We fetching permissions via UserModel helper or manually
        const permissions = await UserModel.getPermissions(user.id);

        const token = generateToken(user);

        // Exclude password
        const { password: _, ...userWithoutPassword } = user;

        // Add permissions to response
        userWithoutPassword.permissions = permissions;

        console.log('[LOGIN] Login successful for user:', email);

        // Audit Log
        logAction(user.id, user.username || user.email, 'Login', 'Auth', 'User logged in successfully', req);

        res.json({
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('[LOGIN] Error during login:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    // Mock implementation - adapt if needed to DB
    const { email } = req.body;
    const user = await UserModel.getByEmail(email);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Logic to save reset token to DB not implemented in detail in provided User Model
    // Skipping refactor of optional feature for brevity unless requested.
    // ...
    res.json({ message: 'Password reset link sent to email (Mock)' });
};

exports.resetPassword = async (req, res) => {
    // ...
    res.status(501).json({ message: 'Implemented later' });
};

exports.refreshToken = (req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const updates = req.body;

        // Check email duplicates
        if (updates.email) {
            const existing = await UserModel.getByEmail(updates.email);
            if (existing && existing.id !== userId) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }

        const updatedUser = await UserModel.update(userId, updates);

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { password, ...userResponse } = updatedUser;

        res.json({
            message: 'Profile updated successfully',
            user: userResponse
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;

        const user = await UserModel.getById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await UserModel.update(userId, { password: hashedPassword });

        res.json({ message: 'Password changed successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
