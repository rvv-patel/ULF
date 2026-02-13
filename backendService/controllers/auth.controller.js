const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const DATA_FILE = path.join(__dirname, '../data/users.json');
const ROLES_FILE = path.join(__dirname, '../data/roles.json');

const readData = () => {
    if (!fs.existsSync(DATA_FILE)) {
        return { users: [] };
    }
    const data = fs.readFileSync(DATA_FILE);
    try {
        return JSON.parse(data);
    } catch (e) {
        return { users: [] };
    }
};

const readRoles = () => {
    if (!fs.existsSync(ROLES_FILE)) {
        return { roles: [] };
    }
    const data = fs.readFileSync(ROLES_FILE);
    try {
        return JSON.parse(data);
    } catch (e) {
        return { roles: [] };
    }
};

const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

const generateToken = (user) => {
    return jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'super_secret_key_12345',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
};

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const data = readData();

        // Check duplicates
        if (data.users.find(u => u.email === email)) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        if (data.users.find(u => u.username === username)) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: Date.now(),
            username,
            email,
            password: hashedPassword,
            role: 'user', // Default role

            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            permissions: [], // Default permissions?
            // Optional profile fields
            firstName: req.body.firstName || '',
            lastName: req.body.lastName || '',
            status: 'active'
        };

        data.users.unshift(newUser);
        writeData(data);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        console.log('[LOGIN] Received login request:', { email: req.body.email });

        const { email, password } = req.body;
        const data = readData();

        console.log('[LOGIN] Total users in database:', data.users.length);

        const user = data.users.find(u => u.email === email);
        if (!user) {
            console.log('[LOGIN] User not found for email:', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log('[LOGIN] User found:', { id: user.id, email: user.email, status: user.status });

        if (user.status !== 'active') {
            console.log('[LOGIN] User account is not active:', user.status);
            return res.status(403).json({ message: 'Account is inactive' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('[LOGIN] Password mismatch for user:', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log('[LOGIN] Password matched, generating token');

        // Get Role Permissions
        const rolesData = readRoles();
        const userRole = rolesData.roles.find(r => r.name === user.role);
        const rolePermissions = userRole ? userRole.permissions : [];

        console.log('[LOGIN] User role:', user.role, 'Permissions count:', rolePermissions.length);

        // Merge with user-specific permissions (if any)
        const userSpecificPermissions = user.permissions || [];
        const uniquePermissions = [...new Set([...rolePermissions, ...userSpecificPermissions])];

        const token = generateToken(user);

        // Exclude password from response
        const { password: _, ...userWithoutPassword } = user;

        // Override permissions in the response user object
        userWithoutPassword.permissions = uniquePermissions;

        console.log('[LOGIN] Login successful for user:', email);

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
    // Mock implementation
    const { email } = req.body;
    const data = readData();
    const user = data.users.find(u => u.email === email);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Save user with token
    const index = data.users.findIndex(u => u.id === user.id);
    data.users[index] = user;
    writeData(data);

    // Send email (mock)
    console.log(`[EMAIL SERVICE] Password reset link for ${email}: http://localhost:3000/reset-password?token=${resetToken}`);

    res.json({ message: 'Password reset link sent to email' });
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Find user by token (simplified, ideally verify JWT first)
        const data = readData();
        const user = data.users.find(u => u.resetToken === token);

        if (!user || user.resetTokenExpiry < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpiry = null;

        const index = data.users.findIndex(u => u.id === user.id);
        data.users[index] = user;
        writeData(data);

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.refreshToken = (req, res) => {
    // Placeholder for refresh token logic
    res.status(501).json({ message: 'Not implemented yet' });
};

exports.updateProfile = (req, res) => {
    try {
        const data = readData();
        const userId = req.user.userId;
        const index = data.users.findIndex(u => u.id === userId);

        if (index === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = data.users[index];
        const { firstName, middleName, lastName, phone, email, address } = req.body;

        // Check duplicates if changing email
        if (email && email !== user.email) {
            if (data.users.find(u => u.email === email && u.id !== userId)) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }

        // Update allowed fields
        const updatedUser = {
            ...user,
            firstName: firstName || user.firstName,
            middleName: middleName || user.middleName,
            lastName: lastName || user.lastName,
            phone: phone || user.phone,
            email: email || user.email,
            address: address || user.address
        };

        data.users[index] = updatedUser;
        writeData(data);

        // Remove sensitive data
        const { password, ...userResponse } = updatedUser;

        // We might want to issue a new token if critical info changed, 
        // but for now, just return the user.
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
        const data = readData();

        const index = data.users.findIndex(u => u.id === userId);
        if (index === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = data.users[index];

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        data.users[index].password = hashedPassword;

        writeData(data);
        res.json({ message: 'Password changed successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
