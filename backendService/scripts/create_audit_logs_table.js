const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'legal_app_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
});

async function migrate() {
    try {
        console.log('🔌 Connecting to database...');
        const client = await pool.connect();

        try {
            console.log('🛠️ Creating audit_logs table...');
            // Create table with camelCase columns
            await client.query(`
                CREATE TABLE IF NOT EXISTS audit_logs (
                    id BIGSERIAL PRIMARY KEY,
                    "userId" BIGINT,
                    "userName" VARCHAR(255),
                    "action" VARCHAR(50),
                    "module" VARCHAR(50),
                    "details" TEXT,
                    "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    "ipAddress" VARCHAR(45)
                );
            `);
            console.log('✅ audit_logs table created.');

            // Read existing logs
            const jsonPath = path.join(__dirname, '../data/auditLogs.json');
            if (fs.existsSync(jsonPath)) {
                console.log('📂 Reading existing auditLogs.json...');
                const rawData = fs.readFileSync(jsonPath);
                const logs = JSON.parse(rawData);

                if (logs.length > 0) {
                    console.log(`🚀 Migrating ${logs.length} logs...`);

                    // Begin transaction
                    await client.query('BEGIN');

                    const insertQuery = `
                        INSERT INTO audit_logs (id, "userId", "userName", "action", "module", "details", "timestamp", "ipAddress")
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                        ON CONFLICT (id) DO NOTHING;
                    `;

                    for (const log of logs) {
                        // Ensure timestamp is valid date object or string
                        // log.timestamp is string in JSON
                        await client.query(insertQuery, [
                            log.id,
                            log.userId,
                            log.userName,
                            log.action,
                            log.module,
                            log.details,
                            log.timestamp,
                            log.ipAddress
                        ]);
                    }

                    await client.query('COMMIT');
                    console.log('✅ Data migration completed.');
                } else {
                    console.log('ℹ️ No logs to migrate.');
                }
            } else {
                console.log('ℹ️ auditLogs.json not found, skipping data migration.');
            }

        } finally {
            client.release();
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await pool.end();
    }
}

migrate();
