const pool = require('../config/database');

class CompanyModel {
    /**
     * Normalize company data
     * Parses ID to integer and ensures emails is an array
     */
    static normalize(row) {
        if (!row) return null;
        return {
            ...row,
            id: parseInt(row.id, 10),
            // Ensure emails is an array (Postgres returns array for TEXT[])
            emails: Array.isArray(row.emails) ? row.emails : []
        };
    }

    /**
     * Get all companies with their documents
     * @returns {Promise<Array>} Array of company objects
     */
    static async getAll() {
        try {
            // Fetch companies
            const companiesResult = await pool.query(
                'SELECT * FROM companies ORDER BY "createdAt" DESC'
            );
            const companies = companiesResult.rows.map(row => this.normalize(row));

            // Fetch all documents (optimized: single query instead of N+1)
            const documentsResult = await pool.query(
                'SELECT * FROM "companyFiles" ORDER BY "createdDateTime" DESC'
            );
            const documents = documentsResult.rows;

            // Map documents to companies
            return companies.map(company => {
                const companyDocs = documents.filter(doc => doc.companyId === company.id);
                return {
                    ...company,
                    documents: companyDocs.map(d => ({
                        id: d.fileId, // Frontend expects OneDrive ID as 'id' for documents
                        dbId: d.id,   // Internal DB ID
                        name: d.name,
                        webUrl: d.webUrl,
                        type: d.type,
                        createdBy: d.createdBy,
                        createdDateTime: d.createdDateTime
                    }))
                };
            });

        } catch (error) {
            console.error('Error in CompanyModel.getAll:', error);
            throw error;
        }
    }

    /**
     * Get company by ID
     * @param {number} id
     */
    static async getById(id) {
        try {
            const result = await pool.query(
                'SELECT * FROM companies WHERE id = $1',
                [id]
            );
            const company = this.normalize(result.rows[0]);

            if (!company) return null;

            // Get documents
            const docsResult = await pool.query(
                'SELECT * FROM "companyDocuments" WHERE "companyId" = $1',
                [id]
            );

            company.documents = docsResult.rows.map(d => ({
                id: d.fileId,
                dbId: d.id,
                name: d.name,
                webUrl: d.webUrl,
                type: d.type,
                createdBy: d.createdBy,
                createdDateTime: d.createdDateTime
            }));

            return company;
        } catch (error) {
            console.error('Error in CompanyModel.getById:', error);
            throw error;
        }
    }

    /**
     * Get company by Name
     * @param {string} name
     */
    static async getByName(name) {
        try {
            const result = await pool.query(
                'SELECT * FROM companies WHERE name = $1',
                [name]
            );
            const company = this.normalize(result.rows[0]);

            if (!company) return null;

            // Get documents
            const docsResult = await pool.query(
                'SELECT * FROM "companyFiles" WHERE "companyId" = $1',
                [company.id]
            );

            company.documents = docsResult.rows.map(d => ({
                id: d.fileId,
                dbId: d.id,
                name: d.name,
                webUrl: d.webUrl,
                type: d.type,
                createdBy: d.createdBy,
                createdDateTime: d.createdDateTime
            }));

            return company;
        } catch (error) {
            console.error('Error in CompanyModel.getByName:', error);
            throw error;
        }
    }

    /**
     * Create new company
     * @param {Object} data 
     */
    static async create(data) {
        try {
            const { name, address, emails } = data;
            const result = await pool.query(
                `INSERT INTO companies (name, address, emails)
                 VALUES ($1, $2, $3)
                 RETURNING *`,
                [name, address, emails]
            );
            return this.normalize(result.rows[0]);
        } catch (error) {
            console.error('Error in CompanyModel.create:', error);
            throw error;
        }
    }

    /**
     * Update company
     * @param {number} id 
     * @param {Object} data 
     */
    static async update(id, data) {
        try {
            const { name, address, emails } = data;
            const result = await pool.query(
                `UPDATE companies 
                 SET name = $1, address = $2, emails = $3, "updatedAt" = CURRENT_TIMESTAMP
                 WHERE id = $4
                 RETURNING *`,
                [name, address, emails, id]
            );
            return this.normalize(result.rows[0]);
        } catch (error) {
            console.error('Error in CompanyModel.update:', error);
            throw error;
        }
    }

    /**
     * Delete company
     * @param {number} id 
     */
    static async delete(id) {
        try {
            const result = await pool.query(
                'DELETE FROM companies WHERE id = $1 RETURNING *',
                [id]
            );
            // Cascade delete will handle documents
            return this.normalize(result.rows[0]);
        } catch (error) {
            console.error('Error in CompanyModel.delete:', error);
            throw error;
        }
    }

    // --- Document Operations ---

    /**
     * Add document to company
     */
    static async addDocument(companyId, docData) {
        try {
            const { id: fileId, name, webUrl, type, createdBy, createdDateTime } = docData;

            // Check if exists to update or insert
            // But usually we just insert. 
            // If fileId already exists for this company, update it?

            const result = await pool.query(
                `INSERT INTO "companyFiles" ("companyId", "fileId", name, "webUrl", type, "createdBy", "createdDateTime")
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING *`,
                [companyId, fileId, name, webUrl, type, createdBy, createdDateTime]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error in CompanyModel.addDocument:', error);
            throw error;
        }
    }

    /**
     * Remove document by File ID
     */
    static async removeDocument(fileId) {
        try {
            const result = await pool.query(
                'DELETE FROM "companyFiles" WHERE "fileId" = $1 RETURNING *',
                [fileId]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error in CompanyModel.removeDocument:', error);
            throw error;
        }
    }
}

module.exports = CompanyModel;
