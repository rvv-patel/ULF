const pool = require('../config/database');

class UserModel {
    /**
     * Get all users
     * Returns camelCase fields as per table definition.
     * Joins with Roles to get Role Name (frontend expects 'role' string in some places, or we adapt)
     */
    static async getAll() {
        try {
            const query = `
                SELECT u.*, r.name as "roleName"
                FROM users u
                LEFT JOIN roles r ON u."roleId" = r.id
                ORDER BY u."createdAt" DESC
            `;
            const result = await pool.query(query);
            return result.rows.map(u => ({
                ...u,
                role: u.roleName // For frontend compatibility if it expects 'role' string
            }));
        } catch (error) {
            throw error;
        }
    }

    static async getById(id) {
        try {
            const query = `
                SELECT u.*, r.name as "roleName"
                FROM users u
                LEFT JOIN roles r ON u."roleId" = r.id
                WHERE u.id = $1
            `;
            const result = await pool.query(query, [id]);
            if (result.rows.length === 0) return null;

            const user = result.rows[0];
            return { ...user, role: user.roleName };
        } catch (error) {
            throw error;
        }
    }

    static async getByEmail(email) {
        try {
            const query = `
                SELECT u.*, r.name as "roleName"
                FROM users u
                LEFT JOIN roles r ON u."roleId" = r.id
                WHERE u.email = $1
            `;
            const result = await pool.query(query, [email]);
            if (result.rows.length === 0) return null;

            const user = result.rows[0];
            return { ...user, role: user.roleName };
        } catch (error) {
            throw error;
        }
    }

    static async create(userData) {
        try {
            // roleName is passed, need to find roleId
            let roleId = userData.roleId;
            if (!roleId && userData.role) {
                const roleRes = await pool.query('SELECT id FROM roles WHERE name = $1', [userData.role]);
                if (roleRes.rows.length > 0) roleId = roleRes.rows[0].id;
            }

            const {
                firstName, middleName, lastName, email, username,
                password, status, phone, avatar, address, branchId, assignedCompanies // camelCase from controller
            } = userData;

            const query = `
                INSERT INTO users (
                    "firstName", "middleName", "lastName", "email", "username",
                    "password", "roleId", "status", "phone", "avatar", "address",
                    "branchId", "assignedCompanies", "dateJoined", "createdAt", "updatedAt"
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW(), NOW())
                RETURNING *
            `;

            const result = await pool.query(query, [
                firstName, middleName, lastName, email, username,
                password, roleId, status || 'active', phone, avatar, address, branchId, assignedCompanies || []
            ]);

            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async update(id, updates) {
        try {
            // Construct dynamic update query
            // Exclude non-DB fields
            const allowedFields = [
                "firstName", "middleName", "lastName", "email", "username",
                "password", "roleId", "status", "phone", "avatar", "address",
                "branchId", "assignedCompanies", "lastForcedLogoutAt"
            ];

            let roleId = updates.roleId;
            if (!roleId && updates.role) {
                const roleRes = await pool.query('SELECT id FROM roles WHERE name = $1', [updates.role]);
                if (roleRes.rows.length > 0) roleId = roleRes.rows[0].id;
            }
            if (roleId) updates.roleId = roleId;

            const keys = Object.keys(updates).filter(k => allowedFields.includes(k));
            if (keys.length === 0) return null;

            const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
            const values = keys.map(k => updates[k]);

            // Add updatedAt
            const result = await pool.query(`
                UPDATE users 
                SET ${setClause}, "updatedAt" = NOW()
                WHERE id = $${keys.length + 1}
                RETURNING *
            `, [...values, id]);

            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async getPermissions(userId) {
        try {
            // Get permissions via Role
            const query = `
                SELECT p.slug
                FROM users u
                JOIN roles r ON u."roleId" = r.id
                JOIN "rolePermissions" rp ON r.id = rp."roleId"
                JOIN permissions p ON rp."permissionId" = p.id
                WHERE u.id = $1
             `;
            const result = await pool.query(query, [userId]);
            // Return array of slugs
            return result.rows.map(r => r.slug);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = UserModel;
