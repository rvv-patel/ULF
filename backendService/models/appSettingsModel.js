const pool = require('../config/database');

class AppSettingsModel {
    /**
     * Get all settings as a key-value object
     */
    static async getAll() {
        try {
            const result = await pool.query('SELECT key, value FROM "appSettings"');
            const settings = {};
            result.rows.forEach(row => {
                // Try to parse JSON values if possible, otherwise string
                try {
                    settings[row.key] = JSON.parse(row.value);
                } catch (e) {
                    settings[row.key] = row.value;
                }
            });
            return settings;
        } catch (error) {
            console.error('Error in AppSettingsModel.getAll:', error);
            throw error;
        }
    }

    /**
     * Get single setting by key
     */
    static async get(key, defaultValue = null) {
        try {
            const result = await pool.query('SELECT value FROM "appSettings" WHERE key = $1', [key]);
            if (result.rows.length === 0) return defaultValue;

            try {
                return JSON.parse(result.rows[0].value);
            } catch (e) {
                return result.rows[0].value;
            }
        } catch (error) {
            console.error(`Error in AppSettingsModel.get(${key}):`, error);
            return defaultValue;
        }
    }

    /**
     * Upsert single setting
     */
    static async set(key, value, description = null) {
        try {
            const stringValue = JSON.stringify(value);
            // We use JSON.stringify to ensure types like booleans/numbers are stored consistently as text
            // Accessors normalize this back.

            const query = `
                INSERT INTO "appSettings" (key, value, description, "updatedAt")
                VALUES ($1, $2, $3, NOW())
                ON CONFLICT (key) DO UPDATE 
                SET value = EXCLUDED.value, 
                    description = COALESCE(EXCLUDED.description, "appSettings".description),
                    "updatedAt" = NOW()
                RETURNING *
            `;
            const result = await pool.query(query, [key, stringValue, description]);
            return result.rows[0];
        } catch (error) {
            console.error(`Error in AppSettingsModel.set(${key}):`, error);
            throw error;
        }
    }

    /**
     * Update multiple settings
     * @param {Object} settingsObject - { key: value, key2: value2 }
     */
    static async setMany(settingsObject) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const keys = Object.keys(settingsObject);

            for (const key of keys) {
                const value = settingsObject[key];
                const stringValue = JSON.stringify(value);

                await client.query(`
                    INSERT INTO "appSettings" (key, value, "updatedAt")
                    VALUES ($1, $2, NOW())
                    ON CONFLICT (key) DO UPDATE 
                    SET value = EXCLUDED.value, "updatedAt" = NOW()
                `, [key, stringValue]);
            }

            await client.query('COMMIT');
            return await this.getAll();
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error in AppSettingsModel.setMany:', error);
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = AppSettingsModel;
