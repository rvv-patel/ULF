const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

const migrateDocuments = async () => {
    console.log('\n🚀 Starting Documents Migration (Auto-Increment IDs)...');

    try {
        // --- Application Documents ---
        console.log('\n📄 Migrating Application Documents...');
        const appDocsPath = path.join(__dirname, '../data/applicationDocuments.json');
        if (fs.existsSync(appDocsPath)) {
            const appDocsData = JSON.parse(fs.readFileSync(appDocsPath, 'utf8'));
            const appDocs = appDocsData.applicationDocuments || [];

            for (const doc of appDocs) {
                // Removed ID from insert to let SERIAL auto-increment
                await pool.query(
                    `INSERT INTO "applicationDocuments" (title, "documentFormat")
                     VALUES ($1, $2)`,
                    [doc.title, doc.documentFormat]
                );
                console.log(`  ✅ Migrated: ${doc.title}`);
            }
        } else {
            console.log('⚠️  applicationDocuments.json not found');
        }

        // --- Company Documents ---
        console.log('\n🏢 Migrating Company Documents...');
        const compDocsPath = path.join(__dirname, '../data/companyDocuments.json');
        if (fs.existsSync(compDocsPath)) {
            const compDocsData = JSON.parse(fs.readFileSync(compDocsPath, 'utf8'));
            const compDocs = compDocsData.companyDocuments || [];

            for (const doc of compDocs) {
                // Removed ID from insert to let SERIAL auto-increment
                await pool.query(
                    `INSERT INTO "companyDocuments" (title, "documentFormat")
                     VALUES ($1, $2)`,
                    [doc.title, doc.documentFormat]
                );
                console.log(`  ✅ Migrated: ${doc.title}`);
            }
        } else {
            console.log('⚠️  companyDocuments.json not found');
        }

        console.log('\n🎉 Migration complete!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrateDocuments();
