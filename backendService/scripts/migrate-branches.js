const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

/**
 * Migration script to move branches data from JSON to PostgreSQL
 * Updated for camelCase column names
 */
async function migrateBranches() {
    console.log('\n🚀 ================================');
    console.log('📦 Branches Migration Script');
    console.log('================================\n');

    try {
        // Step 1: Read existing JSON data
        console.log('Step 1: Reading branches.json...');
        const jsonPath = path.join(__dirname, '../data/branches.json');

        if (!fs.existsSync(jsonPath)) {
            throw new Error('branches.json not found! Make sure the file exists.');
        }

        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        const branches = jsonData.branches || [];

        console.log(`✅ Found ${branches.length} branches to migrate\n`);

        if (branches.length === 0) {
            console.log('⚠️  No branches to migrate. Exiting...');
            process.exit(0);
        }

        // Step 2: Check if table exists
        console.log('Step 2: Checking if branches table exists...');
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'branches'
            );
        `);

        if (!tableCheck.rows[0].exists) {
            throw new Error('Branches table does not exist! Please create it first using schema-branches.sql');
        }
        console.log('✅ Branches table exists\n');

        // Step 3: Migrate each branch
        console.log('Step 3: Migrating branches...\n');
        let successCount = 0;
        let skipCount = 0;

        for (const branch of branches) {
            try {
                await pool.query(
                    `INSERT INTO branches (id, name, "contactPerson", "contactNumber", address, image)
                     VALUES ($1, $2, $3, $4, $5, $6)
                     ON CONFLICT (id) DO NOTHING`,
                    [
                        branch.id,
                        branch.name,
                        branch.contactPerson || null,
                        branch.contactNumber || null,
                        branch.address || null,
                        branch.image || null
                    ]
                );
                console.log(`  ✅ Migrated: ${branch.name} (ID: ${branch.id})`);
                successCount++;
            } catch (error) {
                if (error.code === '23505') {
                    console.log(`  ⏭️  Skipped: ${branch.name} (already exists)`);
                    skipCount++;
                } else {
                    console.error(`  ❌ Failed: ${branch.name} - ${error.message}`);
                }
            }
        }

        console.log('\n================================');
        console.log('📊 Migration Summary:');
        console.log(`  Total branches: ${branches.length}`);
        console.log(`  Successfully migrated: ${successCount}`);
        console.log(`  Skipped (already exists): ${skipCount}`);
        console.log('================================\n');

        // Step 4: Verify migration
        console.log('Step 4: Verifying migration...');
        const result = await pool.query('SELECT COUNT(*) as count FROM branches');
        const totalInDb = result.rows[0].count;

        console.log(`✅ Total branches in database: ${totalInDb}\n`);

        // Step 5: Display sample data
        console.log('Step 5: Sample data from database:');
        const sample = await pool.query('SELECT * FROM branches LIMIT 3');
        console.table(sample.rows.map(b => ({
            ID: b.id,
            Name: b.name,
            Contact: b.contactPerson,
            Phone: b.contactNumber
        })));

        console.log('\n🎉 Migration complete!\n');

        // Close pool
        await pool.end();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Migration failed!');
        console.error('Error:', error.message);
        console.error('\nPlease fix the error and try again.\n');

        await pool.end();
        process.exit(1);
    }
}

// Run migration
migrateBranches();
