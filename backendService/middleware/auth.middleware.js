const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access Token Required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_12345', async (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or Expired Token' });
        }

        try {
            // Check if user was force logged out after token was issued
            const user = await UserModel.getById(decoded.userId);

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
            req.user = { ...userWithoutPassword, userId: user.id }; // Contains full user data including roleName via join
            next();
        } catch (dbError) {
            console.error('Auth Middleware Error:', dbError);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
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
    return async (req, res, next) => {
        if (!req.user) return res.status(401).json({ message: 'Authentication required' });

        try {
            const permissions = await UserModel.getPermissions(req.user.userId);

            // Normalize requiredPermission to always be an array
            const requiredPermissions = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];

            // Check if user has at least one of the required permissions
            const hasPermission = requiredPermissions.some(perm => permissions.includes(perm));

            if (!hasPermission) {
                return res.status(403).json({ message: `Access Forbidden: Requires one of [${requiredPermissions.join(', ')}]` });
            }

            next();
        } catch (error) {
            console.error('Permission Check Error:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    };
};

module.exports = { authenticateToken, authorizeRoles, authorizePermission };


