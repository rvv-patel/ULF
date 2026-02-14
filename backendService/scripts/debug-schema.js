const pool = require('../config/database');

const checkSchema = async () => {
    try {
        console.log('Checking tables...');
        const res = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Tables:', res.rows.map(r => r.table_name));

        console.log('\nChecking columns for "companyDocuments"...');
        const cols = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'companyDocuments'
        `);
        console.log('Columns:', cols.rows.map(r => r.column_name));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkSchema();
