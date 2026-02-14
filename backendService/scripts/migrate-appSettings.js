const fs = require('fs');
const path = require('path');
const AppSettingsModel = require('../models/appSettingsModel');
const pool = require('../config/database');

const SETTINGS_PATH = path.join(__dirname, '../data/appSettings.json');
const SCHEMA_PATH = path.join(__dirname, 'schema-appSettings.sql');

const migrateSettings = async () => {
    try {
        console.log('Starting App Settings Migration...');

        // 1. Run Schema
        console.log('Creating Schema...');
        const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');
        await pool.query(schemaSql);
        console.log('✅ Schema created.');

        // 2. Read JSON
        console.log('Reading JSON...');
        if (!fs.existsSync(SETTINGS_PATH)) {
            console.log('No appSettings.json found. Skipping data import.');
            process.exit(0);
        }
        const data = fs.readFileSync(SETTINGS_PATH, 'utf8');
        const settings = JSON.parse(data);

        // 3. Import Data
        console.log('Importing Data...', settings);
        await AppSettingsModel.setMany(settings || {});

        console.log('✅ App Settings migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrateSettings();
