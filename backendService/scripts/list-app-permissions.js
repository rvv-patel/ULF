const pool = require('../config/database');

async function listAppPermissions() {
    try {
        console.log('\n--- Applications Permissions ---');
        const res = await pool.query("SELECT id, slug, name, description, module, action FROM permissions WHERE module = 'Applications' ORDER BY name");
        console.table(res.rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        pool.end();
    }
}

listAppPermissions();
