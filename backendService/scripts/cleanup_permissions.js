const pool = require('../config/database');

async function cleanupPermissions() {
    try {
        console.log('Cleaning up stale permissions...');

        // List of stale slugs to remove
        const staleSlugs = [
            'create_application',
            'edit_application',
            'delete_application',
            'view_application' // Just in case
        ];

        for (const slug of staleSlugs) {
            // 1. Get Permission ID
            const res = await pool.query("SELECT id FROM permissions WHERE slug = $1", [slug]);
            if (res.rows.length > 0) {
                const id = res.rows[0].id;
                console.log(`Found stale permission '${slug}' (ID: ${id}). Removing...`);

                // 2. Remove from rolePermissions (if not cascading)
                await pool.query('DELETE FROM "rolePermissions" WHERE "permissionId" = $1', [id]);

                // 3. Remove from permissions
                await pool.query('DELETE FROM permissions WHERE id = $1', [id]);
                console.log(`Deleted '${slug}'.`);
            } else {
                console.log(`'${slug}' not found.`);
            }
        }

        console.log('Cleanup complete.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        pool.end();
    }
}

cleanupPermissions();
