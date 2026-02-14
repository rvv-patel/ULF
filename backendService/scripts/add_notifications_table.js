const pool = require('../config/database');

const createNotificationsTable = async () => {
    const client = await pool.connect();
    try {
        console.log('Creating notifications table...');

        await client.query('BEGIN');

        await client.query(`
            CREATE TABLE IF NOT EXISTS "notifications" (
                "id" SERIAL PRIMARY KEY,
                "userId" INTEGER REFERENCES "users"("id") ON DELETE CASCADE,
                "title" TEXT NOT NULL,
                "message" TEXT NOT NULL,
                "type" TEXT DEFAULT 'info',
                "isRead" BOOLEAN DEFAULT FALSE,
                "link" TEXT,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Index for faster queries by user and read status
        await client.query(`
            CREATE INDEX IF NOT EXISTS "idx_notifications_userId" ON "notifications" ("userId");
        `);

        await client.query('COMMIT');
        console.log('Notifications table created successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating notifications table:', error);
    } finally {
        client.release();
        process.exit();
    }
};

createNotificationsTable();
