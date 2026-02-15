const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

const JSON_PATH = path.join(__dirname, '../data/applications.json');

const migrateData = async () => {
    const client = await pool.connect();
    try {
        console.log('Reading JSON data...');
        if (!fs.existsSync(JSON_PATH)) {
            console.error('applications.json not found!');
            return;
        }

        const rawData = fs.readFileSync(JSON_PATH, 'utf8');
        const jsonData = JSON.parse(rawData);
        const applications = jsonData.applications || [];

        console.log(`Found ${applications.length} applications to migrate.`);

        await client.query('BEGIN');

        for (const app of applications) {
            // Insert Application
            await client.query(`
                INSERT INTO applications (
                    id, "fileNumber", "date", company, "companyReference", "applicantName",
                    "proposedOwner", "currentOwner", "branchName", "propertyAddress", city,
                    status, "sendToMail", "onedriveFolderId", "onedriveFolderUrl"
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                ON CONFLICT (id) DO NOTHING
            `, [
                app.id,
                app.fileNumber,
                app.date,
                app.company,
                app.companyReference,
                app.applicantName,
                app.proposedOwner,
                app.currentOwner,
                app.branchName,
                app.propertyAddress,
                app.city,
                app.status,
                app.sendToMail,
                app.onedriveFolderId || null,
                app.onedriveFolderUrl || null
            ]);

            // Insert Queries
            if (app.queries && app.queries.length > 0) {
                for (const query of app.queries) {
                    await client.query(`
                        INSERT INTO application_queries (
                            id, "applicationId", "date", "queryDetails", remarks,
                            "raisedBy", "isResolved", "resolvedBy", "resolvedDate"
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                        ON CONFLICT (id) DO NOTHING
                    `, [
                        query.id,
                        app.id,
                        query.date,
                        query.queryDetails,
                        query.remarks,
                        query.raisedBy,
                        query.isResolved,
                        query.resolvedBy,
                        query.resolvedDate
                    ]);
                }
            }

            // Insert Documents
            if (app.documents && app.documents.length > 0) {
                for (const doc of app.documents) {
                    await client.query(`
                        INSERT INTO application_documents (
                            id, "applicationId", name, "webUrl", type, "sourceFileId", "createdDateTime"
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                        ON CONFLICT (id) DO NOTHING
                    `, [
                        doc.id,
                        app.id,
                        doc.name,
                        doc.webUrl,
                        doc.type,
                        doc.sourceFileId,
                        doc.createdDateTime || new Date()
                    ]);
                }
            }

            // Insert PDF Uploads
            if (app.pdfUploads && app.pdfUploads.length > 0) {
                for (const pdf of app.pdfUploads) {
                    await client.query(`
                        INSERT INTO application_pdf_uploads (
                            id, "applicationId", "pdfDocId", title, "fileName",
                            "uploadedAt", "uploadedBy", "fileId", "fileUrl", path, "isLocked"
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                        ON CONFLICT (id) DO NOTHING
                    `, [
                        pdf.id,
                        app.id,
                        pdf.pdfDocId,
                        pdf.title,
                        pdf.fileName,
                        pdf.uploadedAt,
                        pdf.uploadedBy,
                        pdf.fileId,
                        pdf.fileUrl,
                        pdf.path,
                        pdf.isLocked || false
                    ]);
                }
            }
        }

        await client.query('COMMIT');
        console.log('Migration completed successfully.');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', error);
    } finally {
        client.release();
        pool.end();
    }
};

migrateData();
