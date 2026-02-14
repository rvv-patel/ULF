# PostgreSQL Setup Instructions

This document contains the PostgreSQL connection settings template and setup instructions.

## Step 1: Update .env File

After installing PostgreSQL, update your `.env` file with these settings:

```env
# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=legal_app_db
DB_USER=postgres
DB_PASSWORD=YOUR_ACTUAL_PASSWORD
```

Replace `YOUR_ACTUAL_PASSWORD` with the password you set during PostgreSQL installation.

## Step 2: Create Database

1. Open **pgAdmin 4**
2. Right-click **Databases** → **Create** → **Database**
3. Name: `legal_app_db`
4. Click **Save**

## Step 3: Create Branches Table

1. Click on `legal_app_db` → **Query Tool** (toolbar)
2. Open and run `scripts/schema-branches.sql`
3. You should see "Query returned successfully"

## Step 4: Install Package

```bash
npm install pg
```

## Step 5: Run Migration

```bash
node scripts/migrate-branches.js
```

## Verify Setup

Start your server and you should see:
```
✅ Connected to PostgreSQL database
✅ Database connection test successful
```
