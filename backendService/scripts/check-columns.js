require('dotenv').config();
const pool = require('../config/database');

async function checkColumns() {
    console.log('\n🔍 Checking branch table columns...\n');

    try {
        const result = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'branches' 
            ORDER BY ordinal_position;
        `);

        console.log('Current columns in branches table:\n');
        result.rows.forEach(col => {
            console.log(`  - ${col.column_name} (${col.data_type})`);
        });

        console.log('\n');
        await pool.end();
    } catch (error) {
        console.error('Error:', error.message);
        await pool.end();
    }
}

checkColumns();
