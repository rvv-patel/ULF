const pool = require('../config/database');

const createTables = async () => {
    try {
        console.log('🔄 Initializing Documents Tables (Auto-Increment ID)...');

        // Drop existing tables
        await pool.query('DROP TABLE IF EXISTS "applicationDocuments"');
        await pool.query('DROP TABLE IF EXISTS "companyDocuments"');
        await pool.query('DROP TABLE IF EXISTS "application_documents"');
        await pool.query('DROP TABLE IF EXISTS "company_documents"');

        // Application Documents Table (SERIAL ID)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS "applicationDocuments" (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                "documentFormat" VARCHAR(50) DEFAULT 'PDF',
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Created "applicationDocuments" table with SERIAL ID');

        // Company Documents Table (SERIAL ID)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS "companyDocuments" (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                "documentFormat" VARCHAR(50) DEFAULT '.docx',
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Created "companyDocuments" table with SERIAL ID');

        console.log('🎉 Database initialization complete!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error initializing database:', error);
        process.exit(1);
    }
};

createTables();
