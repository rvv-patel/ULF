const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const DATA_FILE = path.join(__dirname, '../data/users.json');
const ROLES_FILE = path.join(__dirname, '../data/roles.json');

const readData = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) return { users: [] };
        return JSON.parse(fs.readFileSync(DATA_FILE));
    } catch (e) { return { users: [] }; }
};

const readRoles = () => {
    try {
        if (!fs.existsSync(ROLES_FILE)) return { roles: [] };
        return JSON.parse(fs.readFileSync(ROLES_FILE));
    } catch (e) { return { roles: [] }; }
};

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access Token Required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_12345', (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or Expired Token' });
        }

        // Check if user was force logged out after token was issued
        const usersData = readData();
        const user = usersData.users.find(u => u.id === decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Check if user status is active
        if (user.status !== 'active') {
            return res.status(403).json({ message: 'Account is inactive. Please contact administrator.' });
        }

        // Check if token was issued before force logout
        if (user.lastForcedLogoutAt) {
            const tokenIssuedAt = decoded.iat * 1000; // Convert to milliseconds
            const forcedLogoutTime = new Date(user.lastForcedLogoutAt).getTime();

            if (tokenIssuedAt < forcedLogoutTime) {
                return res.status(401).json({ message: 'Session invalidated. Please login again.' });
            }
        }

        // Exclude password and ensure userId is present for compatibility
        const { password, ...userWithoutPassword } = user;
        req.user = { ...userWithoutPassword, userId: user.id }; // Contains full user data including assignedCompanies and userId
        next();
    });
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ message: 'Authentication required' });
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access Forbidden: Insufficient Permissions' });
        }
        next();
    };
};

const authorizePermission = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ message: 'Authentication required' });

        // optimize: if 'admin' role, maybe bypass? No, explicit is better.
        // But for this 'Admin' role in roles.json, it has all permissions listed.

        // Fetch fresh data to get permissions
        const usersData = readData();
        const rolesData = readRoles();

        const user = usersData.users.find(u => u.id === req.user.userId);
        if (!user) return res.status(401).json({ message: 'User not found' });

        const role = rolesData.roles.find(r => r.name === user.role);

        const rolePermissions = role ? role.permissions : [];
        const userPermissions = user.permissions || [];
        const allPermissions = new Set([...rolePermissions, ...userPermissions]);

        if (!allPermissions.has(requiredPermission)) {
            return res.status(403).json({ message: `Access Forbidden: Requires ${requiredPermission}` });
        }

        next();
    };
};

module.exports = { authenticateToken, authorizeRoles, authorizePermission };


