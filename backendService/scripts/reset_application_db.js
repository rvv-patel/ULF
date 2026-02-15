const pool = require('../config/database');

const resetDb = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Truncating tables and resetting identities...');

        // TRUNCATE table_name RESTART IDENTITY CASCADE;
        // This removes all rows and resets the auto-increment counter.
        // CASCADE ensures dependent rows in foreign key tables are also removed (though we list them for clarity).

        await client.query(`
            TRUNCATE TABLE 
                applications, 
                application_queries, 
                application_documents, 
                application_pdf_uploads, 
                email_trigger_history
            RESTART IDENTITY CASCADE;
        `);

        await client.query('COMMIT');
        console.log('Database reset successfully. All application data cleared and IDs reset to 1.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error resetting database:', error);
    } finally {
        client.release();
        pool.end();
    }
};

resetDb();
