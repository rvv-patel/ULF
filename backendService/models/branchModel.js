const pool = require('../config/database');

class BranchModel {
    /**
     * Normalize branch data (convert ID from string to number)
     */
    static normalize(row) {
        if (!row) return null;
        return {
            ...row,
            id: parseInt(row.id, 10)
        };
    }

    /**
     * Get all branches
     * @returns {Promise<Array>} Array of branch objects
     */
    static async getAll() {
        try {
            const result = await pool.query(
                'SELECT * FROM branches ORDER BY name ASC'
            );
            return result.rows.map(row => this.normalize(row));
        } catch (error) {
            console.error('Error in BranchModel.getAll:', error);
            throw error;
        }
    }

    /**
     * Get branch by ID
     * @param {number} id - Branch ID
     * @returns {Promise<Object|null>} Branch object or null
     */
    static async getById(id) {
        try {
            const result = await pool.query(
                'SELECT * FROM branches WHERE id = $1',
                [id]
            );
            return this.normalize(result.rows[0]);
        } catch (error) {
            console.error('Error in BranchModel.getById:', error);
            throw error;
        }
    }

    /**
     * Create new branch
     * @param {Object} branch - Branch data
     * @returns {Promise<Object>} Created branch
     */
    static async create(branch) {
        try {
            const { id, name, contactPerson, contactNumber, address, image } = branch;

            const result = await pool.query(
                `INSERT INTO branches (id, name, "contactPerson", "contactNumber", address, image)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING *`,
                [id, name, contactPerson, contactNumber, address, image]
            );

            return this.normalize(result.rows[0]);
        } catch (error) {
            console.error('Error in BranchModel.create:', error);
            throw error;
        }
    }

    /**
     * Update branch
     * @param {number} id - Branch ID
     * @param {Object} updates - Updated fields
     * @returns {Promise<Object|null>} Updated branch or null
     */
    static async update(id, updates) {
        try {
            const { name, contactPerson, contactNumber, address, image } = updates;

            const result = await pool.query(
                `UPDATE branches 
                 SET name = $1, 
                     "contactPerson" = $2, 
                     "contactNumber" = $3, 
                     address = $4, 
                     image = $5,
                     "updatedAt" = CURRENT_TIMESTAMP
                 WHERE id = $6
                 RETURNING *`,
                [name, contactPerson, contactNumber, address, image, id]
            );

            return this.normalize(result.rows[0]);
        } catch (error) {
            console.error('Error in BranchModel.update:', error);
            throw error;
        }
    }

    /**
     * Delete branch
     * @param {number} id - Branch ID
     * @returns {Promise<Object|null>} Deleted branch or null
     */
    static async delete(id) {
        try {
            const result = await pool.query(
                'DELETE FROM branches WHERE id = $1 RETURNING *',
                [id]
            );
            return this.normalize(result.rows[0]);
        } catch (error) {
            console.error('Error in BranchModel.delete:', error);
            throw error;
        }
    }
}

module.exports = BranchModel;
