const pool = require('../config/database');

class RoleModel {
    /**
     * Get all roles with permission slugs and user count
     */
    static async getAll() {
        try {
            // Get Roles
            const rolesRes = await pool.query('SELECT * FROM roles ORDER BY "createdAt" DESC');
            const roles = rolesRes.rows;

            // Get Permissions for each role
            // Optimization: Could be a single JOIN query, but keeping it simple for now to match JSON structure expected by frontend
            for (let role of roles) {
                const permsRes = await pool.query(`
                    SELECT p.slug 
                    FROM "rolePermissions" rp
                    JOIN permissions p ON rp."permissionId" = p.id
                    WHERE rp."roleId" = $1
                `, [role.id]);

                role.permissions = permsRes.rows.map(r => r.slug);

                // Get User Count
                const countRes = await pool.query(`
                    SELECT COUNT(*) as count FROM users WHERE "roleId" = $1
                `, [role.id]);
                role.userCount = parseInt(countRes.rows[0].count);
            }

            return roles;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get role by ID
     */
    static async getById(id) {
        try {
            const result = await pool.query('SELECT * FROM roles WHERE id = $1', [id]);
            if (result.rows.length === 0) return null;

            const role = result.rows[0];

            // Get Permissions
            const permsRes = await pool.query(`
                SELECT p.slug 
                FROM "rolePermissions" rp
                JOIN permissions p ON rp."permissionId" = p.id
                WHERE rp."roleId" = $1
            `, [id]);
            role.permissions = permsRes.rows.map(r => r.slug);

            return role;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Create Role
     */
    static async create(roleData) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const { name, description, permissions } = roleData; // permissions is array of slugs

            // Insert Role
            const roleRes = await client.query(`
                INSERT INTO roles (name, description, "createdAt", "updatedAt")
                VALUES ($1, $2, NOW(), NOW())
                RETURNING *
            `, [name, description]);
            const newRole = roleRes.rows[0];

            // Insert Permissions
            if (permissions && permissions.length > 0) {
                // Get Permission IDs from Slugs
                const permIdsRes = await client.query(`
                    SELECT id FROM permissions WHERE slug = ANY($1)
                `, [permissions]);

                for (const row of permIdsRes.rows) {
                    await client.query(`
                        INSERT INTO "rolePermissions" ("roleId", "permissionId")
                        VALUES ($1, $2)
                    `, [newRole.id, row.id]);
                }
            }

            await client.query('COMMIT');

            // Return full object with slugs
            newRole.permissions = permissions || [];
            newRole.userCount = 0;

            return newRole;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Update Role
     */
    static async update(id, roleData) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const { name, description, permissions } = roleData;

            // Update Role
            const roleRes = await client.query(`
                UPDATE roles 
                SET name = $1, description = $2, "updatedAt" = NOW()
                WHERE id = $3
                RETURNING *
            `, [name, description, id]);

            if (roleRes.rows.length === 0) {
                await client.query('ROLLBACK');
                return null;
            }
            const updatedRole = roleRes.rows[0];

            // Update Permissions (Full replacement strategy)
            await client.query('DELETE FROM "rolePermissions" WHERE "roleId" = $1', [id]);

            if (permissions && permissions.length > 0) {
                const permIdsRes = await client.query(`
                    SELECT id FROM permissions WHERE slug = ANY($1)
                `, [permissions]);

                for (const row of permIdsRes.rows) {
                    await client.query(`
                        INSERT INTO "rolePermissions" ("roleId", "permissionId")
                        VALUES ($1, $2)
                    `, [id, row.id]);
                }
            }

            await client.query('COMMIT');

            updatedRole.permissions = permissions;
            const countRes = await pool.query(`SELECT COUNT(*) as count FROM users WHERE "roleId" = $1`, [id]);
            updatedRole.userCount = parseInt(countRes.rows[0].count);

            return updatedRole;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Delete Role
     */
    static async delete(id) {
        try {
            // Check if users are assigned
            const userCheck = await pool.query('SELECT COUNT(*) FROM users WHERE "roleId" = $1', [id]);
            if (parseInt(userCheck.rows[0].count) > 0) {
                throw new Error('Cannot delete role with assigned users.');
            }

            const result = await pool.query('DELETE FROM roles WHERE id = $1 RETURNING *', [id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
}

module.exports = RoleModel;
