const pool = require('../config/database');

async function checkPermissions() {
    try {
        console.log('--- Roles ---');
        const roles = await pool.query('SELECT * FROM roles');
        console.table(roles.rows);

        console.log('\n--- Permissions ---');
        const permissions = await pool.query('SELECT * FROM permissions');
        console.table(permissions.rows);

        console.log('\n--- Admin Permissions ---');
        const adminRole = roles.rows.find(r => r.name === 'Admin');
        if (adminRole) {
            const adminPerms = await pool.query(`
                SELECT p.name, p.slug 
                FROM "rolePermissions" rp
                JOIN permissions p ON rp."permissionId" = p.id
                WHERE rp."roleId" = $1
            `, [adminRole.id]);
            console.table(adminPerms.rows);

            const hasAssign = adminPerms.rows.some(p => p.slug === 'assign_user_companies');
            console.log(`\nAdmin has 'assign_user_companies': ${hasAssign}`);
        } else {
            console.log('Admin role not found');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        pool.end();
    }
}

checkPermissions();
