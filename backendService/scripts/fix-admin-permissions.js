const pool = require('../config/database');

async function fixPermissions() {
    try {
        console.log('Fixing Admin permissions...');

        // 1. Get Admin Role ID
        const roleRes = await pool.query("SELECT id FROM roles WHERE name = 'Admin'");
        if (roleRes.rows.length === 0) {
            console.error('Admin role not found!');
            return;
        }
        const adminRoleId = roleRes.rows[0].id;
        console.log('Admin Role ID:', adminRoleId);

        // 2. Check/Create Permission
        const permSlug = 'assign_user_companies';
        let permId;

        const permRes = await pool.query("SELECT id FROM permissions WHERE slug = $1", [permSlug]);
        if (permRes.rows.length > 0) {
            permId = permRes.rows[0].id;
            console.log(`Permission '${permSlug}' exists. ID:`, permId);
        } else {
            console.log(`Permission '${permSlug}' not found. Creating...`);
            const newPerm = await pool.query(
                "INSERT INTO permissions (name, slug, description, module) VALUES ($1, $2, $3, $4) RETURNING id",
                ['Assign Company', permSlug, 'Allow assigning companies to users', 'users']
            );
            permId = newPerm.rows[0].id;
            console.log(`Created permission '${permSlug}'. ID:`, permId);
        }

        // 3. Assign to Admin
        const checkAssign = await pool.query(
            'SELECT * FROM "rolePermissions" WHERE "roleId" = $1 AND "permissionId" = $2',
            [adminRoleId, permId]
        );

        if (checkAssign.rows.length === 0) {
            await pool.query(
                'INSERT INTO "rolePermissions" ("roleId", "permissionId") VALUES ($1, $2)',
                [adminRoleId, permId]
            );
            console.log(`Assigned '${permSlug}' to Admin role.`);
        } else {
            console.log(`'${permSlug}' is already assigned to Admin role.`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        pool.end();
    }
}

fixPermissions();
