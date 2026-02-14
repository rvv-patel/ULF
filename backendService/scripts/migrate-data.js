const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

const JSON_PATH = path.join(__dirname, '../data/companies.json');

const migrateData = async () => {
    let client;
    try {
        console.log('Reading JSON data...');
        if (!fs.existsSync(JSON_PATH)) {
            console.error('companies.json not found!');
            process.exit(1);
        }

        const rawData = fs.readFileSync(JSON_PATH, 'utf8');
        const jsonData = JSON.parse(rawData);
        const companies = jsonData.companies || [];

        console.log(`Found ${companies.length} companies to migrate.`);

        client = await pool.connect();
        await client.query('BEGIN');

        // Track ID mapping (Old ID -> New DB ID)
        const idMap = new Map();

        // 1. Separate companies into two groups
        const smallIdCompanies = [];
        const largeIdCompanies = [];

        for (const company of companies) {
            const id = parseInt(company.id, 10);
            if (id < 2147483647) {
                smallIdCompanies.push(company);
            } else {
                largeIdCompanies.push(company);
            }
        }

        // 2. Insert small ID companies (Preserve IDs)
        for (const company of smallIdCompanies) {
            console.log(`Migrating company (Preserving ID): ${company.name} (ID: ${company.id})`);
            const emails = Array.isArray(company.emails) ? company.emails : [];
            const address = company.address || null;

            await client.query(`
                INSERT INTO companies (id, name, address, emails)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (id) DO UPDATE 
                SET name = EXCLUDED.name, 
                    address = EXCLUDED.address,
                    emails = EXCLUDED.emails
            `, [company.id, company.name, address, emails]);

            idMap.set(parseInt(company.id), parseInt(company.id));
        }

        // 3. Update Sequence to max ID
        console.log('Updating sequence to match inserted IDs...');
        await client.query(`
            SELECT setval(pg_get_serial_sequence('companies', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM companies;
        `);

        // 4. Insert large ID companies (Generate New IDs)
        for (const company of largeIdCompanies) {
            console.log(`Migrating company (New ID): ${company.name} (Old ID: ${company.id})`);
            const emails = Array.isArray(company.emails) ? company.emails : [];
            const address = company.address || null;

            const res = await client.query(`
                INSERT INTO companies (name, address, emails)
                VALUES ($1, $2, $3)
                RETURNING id;
            `, [company.name, address, emails]);

            const newId = res.rows[0].id;
            idMap.set(parseInt(company.id), newId);
            console.log(`  -> New ID: ${newId}`);
        }

        // 5. Insert Documents for ALL companies
        for (const company of companies) {
            const documents = Array.isArray(company.documents) ? company.documents : [];
            const oldId = parseInt(company.id);
            const newId = idMap.get(oldId);

            if (documents.length > 0 && newId) {
                console.log(`  - Migrating ${documents.length} documents for ${company.name}...`);

                for (const doc of documents) {
                    const docQuery = `
                        INSERT INTO "companyFiles" 
                        ("companyId", "fileId", name, "webUrl", type, "createdBy", "createdDateTime")
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                    `;

                    await client.query(docQuery, [
                        newId,
                        doc.id,
                        doc.name,
                        doc.webUrl,
                        doc.type,
                        doc.createdBy || 'System',
                        doc.createdDateTime
                    ]);
                }
            }
        }

        await client.query('COMMIT');
        console.log('✅ Data migration completed successfully.');

    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error('❌ Data migration failed:', error);
        process.exit(1);
    } finally {
        if (client) client.release();
    }
};

migrateData();
