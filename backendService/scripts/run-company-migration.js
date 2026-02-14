const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

const runMigration = async () => {
    try {
        const sqlPath = path.join(__dirname, 'schema-companies.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running migration from:', sqlPath);

        await pool.query(sql);

        console.log('✅ Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
