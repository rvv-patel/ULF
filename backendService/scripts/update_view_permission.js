const pool = require('../config/database');

async function updateViewPermission() {
    try {
        console.log('Updating view_applications permission name...');

        const slug = 'view_applications';
        const newName = 'View';

        const res = await pool.query(
            "UPDATE permissions SET name = $1 WHERE slug = $2 RETURNING *",
            [newName, slug]
        );

        if (res.rows.length > 0) {
            console.log(`Updated '${slug}' to name '${newName}'.`);
        } else {
            console.log(`'${slug}' not found.`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        pool.end();
    }
}

updateViewPermission();
