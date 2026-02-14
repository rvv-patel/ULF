const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

const PERMISSIONS_FILE = path.join(__dirname, '../data/permissions.json');
const ROLES_FILE = path.join(__dirname, '../data/roles.json');
const USERS_FILE = path.join(__dirname, '../data/users.json');

const readJson = (filePath) => {
    if (!fs.existsSync(filePath)) return [];
    try {
        const data = fs.readFileSync(filePath);
        return JSON.parse(data);
    } catch (e) {
        console.error(`Error reading ${filePath}:`, e);
        return [];
    }
};

const migrate = async () => {
    const client = await pool.connect();
    try {
        console.log('Starting migration...');

        await client.query('BEGIN');

        // 1. Drop existing tables (Order matters for FKs)
        console.log('Dropping old tables...');
        await client.query(`DROP TABLE IF EXISTS "users" CASCADE`);
        await client.query(`DROP TABLE IF EXISTS "rolePermissions" CASCADE`);
        await client.query(`DROP TABLE IF EXISTS "roles" CASCADE`);
        await client.query(`DROP TABLE IF EXISTS "permissions" CASCADE`);

        // 2. Create Tables with camelCase columns
        console.log('Creating new tables...');

        // Permissions
        await client.query(`
            CREATE TABLE "permissions" (
                "id" SERIAL PRIMARY KEY,
                "slug" TEXT UNIQUE NOT NULL,
                "name" TEXT NOT NULL,
                "description" TEXT,
                "module" TEXT,
                "action" TEXT
            )
        `);

        // Roles
        await client.query(`
            CREATE TABLE "roles" (
                "id" SERIAL PRIMARY KEY,
                "name" TEXT UNIQUE NOT NULL,
                "description" TEXT,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Role Permissions
        await client.query(`
            CREATE TABLE "rolePermissions" (
                "roleId" INTEGER REFERENCES "roles"("id") ON DELETE CASCADE,
                "permissionId" INTEGER REFERENCES "permissions"("id") ON DELETE CASCADE,
                PRIMARY KEY ("roleId", "permissionId")
            )
        `);

        // Users
        // Note: branchId is assumed to reference an existing branches table or be nullable/integer
        // We handle branchId carefully. If branches table exists, we should probably reference it.
        // For now, we'll define it as INTEGER to match likely schema, but maybe skipping FK constraint to avoid failure if branches empty/missing.
        // Better: Check if branches table exists? Assuming yes based on user context.
        // But to be safe, we won't add REFERENCES "branches"("id") strict constraint unless we are sure.
        // We will add it if possible. Let's try without strict FK for branchId first to avoid migration block, or just INTEGER.
        await client.query(`
            CREATE TABLE "users" (
                "id" SERIAL PRIMARY KEY,
                "firstName" TEXT,
                "middleName" TEXT,
                "lastName" TEXT,
                "email" TEXT UNIQUE NOT NULL,
                "password" TEXT NOT NULL,
                "username" TEXT UNIQUE,
                "roleId" INTEGER REFERENCES "roles"("id") ON DELETE SET NULL,
                "status" TEXT DEFAULT 'active',
                "phone" TEXT,
                "avatar" TEXT,
                "address" TEXT,
                "dateJoined" DATE,
                "lastForcedLogoutAt" TIMESTAMP,
                "branchId" INTEGER,
                "assignedCompanies" INTEGER[],
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. Migrate Data

        // --- Migrate Permissions ---
        const permissionsData = readJson(PERMISSIONS_FILE);
        const permissionsList = permissionsData.permissions || [];
        console.log(`Migrating ${permissionsList.length} permissions...`);

        const permissionSlugToIdMap = new Map(); // 'view_dashboard' -> 1

        for (const p of permissionsList) {
            const res = await client.query(`
                INSERT INTO "permissions" ("slug", "name", "description", "module", "action")
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id
            `, [p.id, p.name, p.description, p.module, p.action]);

            permissionSlugToIdMap.set(p.id, res.rows[0].id);
        }

        // --- Migrate Roles ---
        const rolesData = readJson(ROLES_FILE);
        const rolesList = rolesData.roles || [];
        console.log(`Migrating ${rolesList.length} roles...`);

        const roleNameToIdMap = new Map(); // 'Admin' -> 1
        // Also map old numeric ID to new ID if needed, but mostly lookups are by name in this app or we simply regenerate
        // App uses Role ID in UI, but Users.json uses Role Name string ('Admin').

        for (const r of rolesList) {
            const res = await client.query(`
                INSERT INTO "roles" ("name", "description")
                VALUES ($1, $2)
                RETURNING id
            `, [r.name, r.description]);

            const newRoleId = res.rows[0].id;
            roleNameToIdMap.set(r.name, newRoleId);

            // Assign Permissions
            if (r.permissions && r.permissions.length > 0) {
                for (const permSlug of r.permissions) {
                    const permId = permissionSlugToIdMap.get(permSlug);
                    if (permId) {
                        await client.query(`
                            INSERT INTO "rolePermissions" ("roleId", "permissionId")
                            VALUES ($1, $2)
                        `, [newRoleId, permId]);
                    }
                }
            }
        }

        // --- Migrate Users ---
        const usersData = readJson(USERS_FILE);
        const usersList = usersData.users || [];
        console.log(`Migrating ${usersList.length} users...`);

        for (const u of usersList) {
            const roleId = roleNameToIdMap.get(u.role);

            // Handle branchId: existing data has numeric branchId (e.g., 3).
            // We keep it as is.
            const branchId = u.branchId || null;
            const assignedCompanies = u.assignedCompanies || [];

            await client.query(`
                INSERT INTO "users" (
                    "firstName", "middleName", "lastName", "email", "password", "username",
                    "roleId", "status", "phone", "avatar", "address", "dateJoined",
                    "lastForcedLogoutAt", "branchId", "assignedCompanies", "createdAt", "updatedAt"
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            `, [
                u.firstName, u.middleName, u.lastName, u.email, u.password || 'default_hash', u.username,
                roleId, u.status || 'active', u.phone, u.avatar, u.address, u.dateJoined,
                u.lastForcedLogoutAt, branchId, assignedCompanies, u.createdAt || new Date(), u.updatedAt || new Date()
            ]);
        }

        await client.query('COMMIT');
        console.log('Migration completed successfully!');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', e);
    } finally {
        client.release();
        process.exit(); // explicitly exit
    }
};

migrate();
