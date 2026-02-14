const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const seedUsers = async () => {
    const client = await pool.connect();
    try {
        console.log('=== Starting database seed ===\n');

        await client.query('BEGIN');

        // Check if tables exist
        const roleCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'roles'
            );
        `);

        if (!roleCheck.rows[0].exists) {
            console.log('⚠️  Database tables not found. Please run migrateFull.js first or create tables.');
            await client.query('ROLLBACK');
            return;
        }

        // 1. Create Permissions
        console.log('Creating permissions...');
        const permissions = [
            { slug: 'view_dashboard', name: 'View Dashboard', module: 'Dashboard', action: 'View' },
            { slug: 'manage_users', name: 'Manage Users', module: 'Users', action: 'Manage' },
            { slug: 'view_applications', name: 'View Applications', module: 'Applications', action: 'View' },
            { slug: 'create_application', name: 'Create Application', module: 'Applications', action: 'Create' },
            { slug: 'edit_application', name: 'Edit Application', module: 'Applications', action: 'Edit' },
            { slug: 'delete_application', name: 'Delete Application', module: 'Applications', action: 'Delete' },
            { slug: 'view_companies', name: 'View Companies', module: 'Companies', action: 'View' },
            { slug: 'manage_companies', name: 'Manage Companies', module: 'Companies', action: 'Manage' },
            { slug: 'view_branches', name: 'View Branches', module: 'Branches', action: 'View' },
            { slug: 'manage_branches', name: 'Manage Branches', module: 'Branches', action: 'Manage' },
        ];

        const permissionIds = {};
        for (const perm of permissions) {
            const result = await client.query(`
                INSERT INTO "permissions" ("slug", "name", "module", "action")
                VALUES ($1, $2, $3, $4)
                ON CONFLICT ("slug") DO UPDATE SET "name" = EXCLUDED."name"
                RETURNING id
            `, [perm.slug, perm.name, perm.module, perm.action]);
            permissionIds[perm.slug] = result.rows[0].id;
        }
        console.log(`✅ Created ${Object.keys(permissionIds).length} permissions`);

        // 2. Create Roles
        console.log('\nCreating roles...');
        const adminRole = await client.query(`
            INSERT INTO "roles" ("name", "description")
            VALUES ($1, $2)
            ON CONFLICT ("name") DO UPDATE SET "description" = EXCLUDED."description"
            RETURNING id
        `, ['Admin', 'Administrator with full access']);
        const adminRoleId = adminRole.rows[0].id;

        const staffRole = await client.query(`
            INSERT INTO "roles" ("name", "description")
            VALUES ($1, $2)
            ON CONFLICT ("name") DO UPDATE SET "description" = EXCLUDED."description"
            RETURNING id
        `, ['Staff', 'Staff member with limited access']);
        const staffRoleId = staffRole.rows[0].id;

        console.log('✅ Created 2 roles');

        // 3. Assign all permissions to Admin
        console.log('\nAssigning permissions to Admin role...');
        for (const permSlug of Object.keys(permissionIds)) {
            await client.query(`
                INSERT INTO "rolePermissions" ("roleId", "permissionId")
                VALUES ($1, $2)
                ON CONFLICT DO NOTHING
            `, [adminRoleId, permissionIds[permSlug]]);
        }
        console.log('✅ Admin role has all permissions');

        // 4. Assign limited permissions to Staff
        console.log('\nAssigning permissions to Staff role...');
        const staffPermissions = ['view_dashboard', 'view_applications', 'view_companies', 'view_branches'];
        for (const permSlug of staffPermissions) {
            await client.query(`
                INSERT INTO "rolePermissions" ("roleId", "permissionId")
                VALUES ($1, $2)
                ON CONFLICT DO NOTHING
            `, [staffRoleId, permissionIds[permSlug]]);
        }
        console.log('✅ Staff role has limited permissions');

        // 5. Create Users
        console.log('\nCreating users...');

        // Hash passwords
        const passwordHash = await bcrypt.hash('Test@123', 10);
        console.log('Password hash generated for: Test@123');

        // Admin user - ravi@gmail.com
        await client.query(`
            INSERT INTO "users" (
                "firstName", "lastName", "email", "password", "username",
                "roleId", "status", "createdAt", "updatedAt"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
            ON CONFLICT ("email") DO UPDATE SET
                "password" = EXCLUDED."password",
                "roleId" = EXCLUDED."roleId",
                "updatedAt" = NOW()
        `, ['Ravi', 'Patel', 'ravi@gmail.com', passwordHash, 'ravi', adminRoleId, 'active']);
        console.log('✅ Created admin user: ravi@gmail.com');

        // Staff user - sagar@gmail.com
        await client.query(`
            INSERT INTO "users" (
                "firstName", "lastName", "email", "password", "username",
                "roleId", "status", "createdAt", "updatedAt"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
            ON CONFLICT ("email") DO UPDATE SET
                "password" = EXCLUDED."password",
                "roleId" = EXCLUDED."roleId",
                "updatedAt" = NOW()
        `, ['Sagar', 'Kumar', 'sagar@gmail.com', passwordHash, 'sagar', staffRoleId, 'active']);
        console.log('✅ Created staff user: sagar@gmail.com');

        await client.query('COMMIT');

        console.log('\n=== Database seed completed successfully! ===');
        console.log('\n📋 Test Credentials:');
        console.log('   Admin: ravi@gmail.com / Test@123');
        console.log('   Staff: sagar@gmail.com / Test@123\n');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Seed failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
};

// Run seed
seedUsers()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
