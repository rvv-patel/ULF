const pool = require('../config/database');

const checkUserAssignments = async () => {
    try {
        console.log('=== Checking User Company Assignments ===\n');

        // Get sagar's user data
        const userResult = await pool.query(`
            SELECT u.id, u.email, u."assignedCompanies", r.name as "roleName"
            FROM users u
            LEFT JOIN roles r ON u."roleId" = r.id
            WHERE u.email = 'sagar@gmail.com'
        `);

        if (userResult.rows.length === 0) {
            console.log('❌ User sagar@gmail.com not found');
            return;
        }

        const user = userResult.rows[0];
        console.log('User:', user.email);
        console.log('Role:', user.roleName);
        console.log('Assigned Company IDs:', user.assignedCompanies);



        // Get company names for assigned IDs
        if (user.assignedCompanies && user.assignedCompanies.length > 0) {
            const companiesResult = await pool.query(`
                SELECT id, name
                FROM companies
                WHERE id = ANY($1::int[])
            `, [user.assignedCompanies]);

            console.log('\nAssigned Companies:');
            companiesResult.rows.forEach(company => {
                console.log(`  - ${company.name} (ID: ${company.id})`);
            });

            // Check applications for these companies
            console.log('\nChecking applications in JSON file...');
            const fs = require('fs');
            const path = require('path');
            const DB_PATH = path.join(__dirname, '../data/applications.json');

            if (fs.existsSync(DB_PATH)) {
                const appsData = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
                const companyNames = companiesResult.rows.map(c => c.name);

                const matchingApps = appsData.applications.filter(app =>
                    companyNames.includes(app.company)
                );

                console.log(`Found ${matchingApps.length} applications for assigned companies`);
                matchingApps.slice(0, 5).forEach(app => {
                    console.log(`  - ${app.fileNumber}: ${app.company}`);
                });
                if (matchingApps.length > 5) {
                    console.log(`  ... and ${matchingApps.length - 5} more`);
                }
            }

        } else {
            console.log('\n⚠️  No companies assigned to this user');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
};

checkUserAssignments();
