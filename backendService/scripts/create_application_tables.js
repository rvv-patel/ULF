const pool = require('../config/database');

const createTables = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Creating applications table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS applications (
                id BIGINT PRIMARY KEY,
                "fileNumber" VARCHAR(255) UNIQUE NOT NULL,
                "date" VARCHAR(255),
                company VARCHAR(255),
                "companyReference" VARCHAR(255),
                "applicantName" VARCHAR(255),
                "proposedOwner" VARCHAR(255),
                "currentOwner" VARCHAR(255),
                "branchName" VARCHAR(255),
                "propertyAddress" TEXT,
                city VARCHAR(255),
                status VARCHAR(50) DEFAULT 'Login',
                "sendToMail" BOOLEAN DEFAULT FALSE,
                "onedriveFolderId" VARCHAR(255),
                "onedriveFolderUrl" TEXT,
                "createdAt" TIMESTAMP DEFAULT NOW(),
                "updatedAt" TIMESTAMP DEFAULT NOW()
            );
        `);

        console.log('Creating application_queries table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS application_queries (
                id BIGINT PRIMARY KEY,
                "applicationId" BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
                "date" VARCHAR(255),
                "queryDetails" TEXT,
                remarks TEXT,
                "raisedBy" VARCHAR(255),
                "isResolved" BOOLEAN DEFAULT FALSE,
                "resolvedBy" VARCHAR(255),
                "resolvedDate" VARCHAR(255)
            );
        `);

        console.log('Creating application_documents table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS application_documents (
                id VARCHAR(255) PRIMARY KEY,
                "applicationId" BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
                name VARCHAR(255),
                "webUrl" TEXT,
                type VARCHAR(50),
                "sourceFileId" VARCHAR(255),
                "createdDateTime" TIMESTAMP DEFAULT NOW()
            );
        `);

        console.log('Creating application_pdf_uploads table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS application_pdf_uploads (
                id VARCHAR(255) PRIMARY KEY,
                "applicationId" BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
                "pdfDocId" VARCHAR(255),
                title VARCHAR(255),
                "fileName" VARCHAR(255),
                "uploadedAt" TIMESTAMP DEFAULT NOW(),
                "uploadedBy" VARCHAR(255),
                "fileId" VARCHAR(255),
                "fileUrl" TEXT,
                path TEXT,
                "isLocked" BOOLEAN DEFAULT FALSE
            );
        `);

        console.log('Creating email_trigger_history table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS email_trigger_history (
                id BIGSERIAL PRIMARY KEY,
                "applicationId" BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
                "triggerName" VARCHAR(255),
                "sentTo" VARCHAR(255),
                "sentAt" TIMESTAMP DEFAULT NOW(),
                status VARCHAR(50)
            );
        `);

        await client.query('COMMIT');
        console.log('All tables created successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating tables:', error);
    } finally {
        client.release();
        pool.end();
    }
};

createTables();
