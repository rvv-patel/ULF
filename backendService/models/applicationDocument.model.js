const pool = require('../config/database');

class ApplicationDocumentModel {
    /**
     * Normalize document data (convert ID from string to number)
     */
    static normalize(row) {
        if (!row) return null;
        return {
            ...row,
            id: parseInt(row.id, 10)
        };
    }

    /**
     * Get all application documents
     */
    static async getAll(params = {}) {
        try {
            const { limit, offset, search, sortBy, order } = params;
            let query = 'SELECT * FROM "applicationDocuments"';
            const values = [];
            let whereClause = '';

            // Search
            if (search) {
                whereClause = `WHERE LOWER(title) LIKE $1 OR LOWER("documentFormat") LIKE $1`;
                values.push(`%${search.toLowerCase()}%`);
            }

            query += ` ${whereClause}`;

            // Sorting
            if (sortBy) {
                // Prevent SQL injection by allowing only specific columns
                const allowedColumns = ['title', 'documentFormat', 'createdAt'];
                const cleanSortBy = allowedColumns.includes(sortBy) ? `"${sortBy}"` : '"createdAt"';
                const cleanOrder = order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
                query += ` ORDER BY ${cleanSortBy} ${cleanOrder}`;
            } else {
                query += ' ORDER BY "createdAt" DESC';
            }

            // Pagination
            if (limit !== undefined && offset !== undefined) {
                query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
                values.push(limit, offset);
            }

            const result = await pool.query(query, values);
            const totalResult = await pool.query(`SELECT COUNT(*) FROM "applicationDocuments" ${whereClause}`, search ? [`%${search.toLowerCase()}%`] : []);

            return {
                items: result.rows.map(row => this.normalize(row)),
                total: parseInt(totalResult.rows[0].count, 10)
            };
        } catch (error) {
            console.error('Error in ApplicationDocumentModel.getAll:', error);
            throw error;
        }
    }

    /**
     * Get document by ID
     */
    static async getById(id) {
        try {
            const result = await pool.query(
                'SELECT * FROM "applicationDocuments" WHERE id = $1',
                [id]
            );
            return this.normalize(result.rows[0]);
        } catch (error) {
            console.error('Error in ApplicationDocumentModel.getById:', error);
            throw error;
        }
    }

    /**
     * Create new document
     */
    static async create(doc) {
        try {
            const { title, documentFormat } = doc;

            const result = await pool.query(
                `INSERT INTO "applicationDocuments" (title, "documentFormat")
                 VALUES ($1, $2)
                 RETURNING *`,
                [title, documentFormat]
            );

            return this.normalize(result.rows[0]);
        } catch (error) {
            console.error('Error in ApplicationDocumentModel.create:', error);
            throw error;
        }
    }

    /**
     * Update document
     */
    static async update(id, updates) {
        try {
            const { title, documentFormat } = updates;

            const result = await pool.query(
                `UPDATE "applicationDocuments" 
                 SET title = COALESCE($1, title), 
                     "documentFormat" = COALESCE($2, "documentFormat"),
                     "updatedAt" = CURRENT_TIMESTAMP
                 WHERE id = $3
                 RETURNING *`,
                [title, documentFormat, id]
            );

            return this.normalize(result.rows[0]);
        } catch (error) {
            console.error('Error in ApplicationDocumentModel.update:', error);
            throw error;
        }
    }

    /**
     * Delete document
     */
    static async delete(id) {
        try {
            const result = await pool.query(
                'DELETE FROM "applicationDocuments" WHERE id = $1 RETURNING *',
                [id]
            );
            return this.normalize(result.rows[0]);
        } catch (error) {
            console.error('Error in ApplicationDocumentModel.delete:', error);
            throw error;
        }
    }

    /**
     * Bulk delete documents
     */
    static async bulkDelete(ids) {
        try {
            const result = await pool.query(
                'DELETE FROM "applicationDocuments" WHERE id = ANY($1) RETURNING *',
                [ids]
            );
            return result.rows.map(row => this.normalize(row));
        } catch (error) {
            console.error('Error in ApplicationDocumentModel.bulkDelete:', error);
            throw error;
        }
    }
}

module.exports = ApplicationDocumentModel;
