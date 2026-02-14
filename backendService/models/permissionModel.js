const pool = require('../config/database');

class PermissionModel {
    /**
     * Get all permissions
     */
    static async getAll() {
        try {
            // Frontend expects 'id' to be the slug string
            const result = await pool.query('SELECT slug as id, name, description, module, action FROM permissions ORDER BY module ASC, name ASC');
            return result.rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = PermissionModel;
