const pool = require('../config/database');
const { logAction } = require('../controllers/auditLog.controller');
const AppSettingsModel = require('../models/appSettingsModel');

// Helper to get full application details including queries, documents, and pdfUploads
const getApplicationDetails = async (id) => {
    const appResult = await pool.query('SELECT * FROM applications WHERE id = $1', [id]);
    if (appResult.rows.length === 0) return null;
    const app = appResult.rows[0];

    const queriesResult = await pool.query('SELECT * FROM application_queries WHERE "applicationId" = $1', [id]);
    app.queries = queriesResult.rows;

    const docsResult = await pool.query('SELECT * FROM application_documents WHERE "applicationId" = $1', [id]);
    app.documents = docsResult.rows;

    const pdfsResult = await pool.query('SELECT * FROM application_pdf_uploads WHERE "applicationId" = $1', [id]);
    app.pdfUploads = pdfsResult.rows;

    return app;
};

exports.getAll = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            sortBy = 'id',
            order = 'desc',
            company = '',
            branch = '',
            status = '',
            dateFrom = '',
            dateTo = ''
        } = req.query;

        let query = 'SELECT * FROM applications WHERE status != \'deleted\'';
        let countQuery = 'SELECT COUNT(*) FROM applications WHERE status != \'deleted\'';
        const queryParams = [];
        let paramCount = 1;

        // Access Control
        if (req.user && req.user.role !== 'Admin') {
            const assignedCompanyIds = req.user.assignedCompanies || [];
            let allowedCompanyNames = [];

            if (assignedCompanyIds.length > 0) {
                const result = await pool.query(
                    'SELECT name FROM companies WHERE id = ANY($1::int[])',
                    [assignedCompanyIds]
                );
                allowedCompanyNames = result.rows.map(c => c.name);
            }

            if (allowedCompanyNames.length > 0) {
                query += ` AND company = ANY($${paramCount}::text[])`;
                countQuery += ` AND company = ANY($${paramCount}::text[])`;
                queryParams.push(allowedCompanyNames);
                paramCount++;
            } else {
                return res.json({ items: [], total: 0, totalPages: 0, currentPage: parseInt(page) });
            }
        }

        // Search
        if (search) {
            query += ` AND (LOWER("applicantName") LIKE $${paramCount} OR LOWER("fileNumber") LIKE $${paramCount} OR LOWER(company) LIKE $${paramCount})`;
            countQuery += ` AND (LOWER("applicantName") LIKE $${paramCount} OR LOWER("fileNumber") LIKE $${paramCount} OR LOWER(company) LIKE $${paramCount})`;
            queryParams.push(`%${search.toLowerCase()}%`);
            paramCount++;
        }

        // Filters
        if (company) {
            query += ` AND company = $${paramCount}`;
            countQuery += ` AND company = $${paramCount}`;
            queryParams.push(company);
            paramCount++;
        }
        if (branch) {
            query += ` AND "branchName" = $${paramCount}`;
            countQuery += ` AND "branchName" = $${paramCount}`;
            queryParams.push(branch);
            paramCount++;
        }
        if (status) {
            query += ` AND status = $${paramCount}`;
            countQuery += ` AND status = $${paramCount}`;
            queryParams.push(status);
            paramCount++;
        }

        // Sorting
        const sortMapping = {
            'id': 'id',
            'date': 'date',
            'fileNumber': '"fileNumber"',
            'applicantName': '"applicantName"',
            'company': 'company',
            'status': 'status'
        };
        const dbSort = sortMapping[sortBy] || 'id';
        query += ` ORDER BY ${dbSort} ${order.toUpperCase()}`;

        // Pagination
        const limitNum = parseInt(limit);
        const offset = (parseInt(page) - 1) * limitNum;

        query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;

        const totalResult = await pool.query(countQuery, queryParams);
        const total = parseInt(totalResult.rows[0].count);

        const itemsResult = await pool.query(query, [...queryParams, limitNum, offset]);
        const items = itemsResult.rows;

        // Fetch queries for these applications to support the "Open Query" indicator in the list
        if (items.length > 0) {
            const appIds = items.map(app => app.id);
            const queriesResult = await pool.query(
                'SELECT * FROM application_queries WHERE "applicationId" = ANY($1::bigint[])',
                [appIds]
            );

            // Map queries to applications
            const queriesByAppId = queriesResult.rows.reduce((acc, query) => {
                if (!acc[query.applicationId]) {
                    acc[query.applicationId] = [];
                }
                acc[query.applicationId].push(query);
                return acc;
            }, {});

            items.forEach(app => {
                app.queries = queriesByAppId[app.id] || [];
            });
        } else {
            items.forEach(app => {
                app.queries = [];
            });
        }

        res.json({
            items: items,
            total,
            totalPages: Math.ceil(total / limitNum),
            currentPage: parseInt(page)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const item = await getApplicationDetails(req.params.id);
        if (!item || item.status === 'deleted') return res.status(404).json({ message: 'Not found' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Helper: generate unique file number
const generateFileNumber = async () => {
    const settings = await AppSettingsModel.getAll();
    let prefix = settings.fileNumberPrefix || 'ULF';
    let sequence = parseInt(settings.fileNumberSequence) || 1000;
    let padding = parseInt(settings.padding) || 4;

    let fileNumber;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 20;

    while (!isUnique && attempts < maxAttempts) {
        const sequenceStr = String(sequence).padStart(padding, '0');
        fileNumber = `${prefix}-${sequenceStr}`;

        const check = await pool.query('SELECT 1 FROM applications WHERE "fileNumber" = $1', [fileNumber]);
        if (check.rows.length === 0) {
            isUnique = true;
        } else {
            sequence++;
        }
        attempts++;
    }

    if (!isUnique) {
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        fileNumber = `${prefix}-${randomNum}`;
    } else {
        await AppSettingsModel.set('fileNumberSequence', sequence + 1);
    }

    return fileNumber;
};

exports.create = async (req, res) => {
    try {
        let fileNumber = req.body.fileNumber;
        if (!fileNumber) {
            fileNumber = await generateFileNumber();
        }

        const {
            date, company, companyReference, applicantName, proposedOwner,
            currentOwner, branchName, propertyAddress, city, sendToMail
        } = req.body;

        const result = await pool.query(`
            INSERT INTO applications (
                "fileNumber", "date", company, "companyReference", "applicantName",
                "proposedOwner", "currentOwner", "branchName", "propertyAddress", city,
                status, "sendToMail"
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING id, "createdAt"
        `, [
            fileNumber, date, company, companyReference, applicantName,
            proposedOwner, currentOwner, branchName, propertyAddress, city,
            'Login', sendToMail || false
        ]);

        const newId = result.rows[0].id; // Auto-incremented ID from returning

        const newItem = {
            id: newId,
            fileNumber,
            date, company, companyReference, applicantName, proposedOwner,
            currentOwner, branchName, propertyAddress, city,
            status: 'Login',
            sendToMail: sendToMail || false,
            createdAt: result.rows[0].createdAt
        };

        // Attempt to create OneDrive folder
        try {
            const onedriveService = require('../services/onedriveService');
            if (onedriveService.isAuthenticated()) {
                const odResult = await onedriveService.createApplicationFolder(
                    fileNumber,
                    applicantName || 'Unknown Applicant',
                    company || ''
                );

                await pool.query(`
                    UPDATE applications 
                    SET "onedriveFolderId" = $1, "onedriveFolderUrl" = $2
                    WHERE id = $3
                `, [odResult.folderId, odResult.webUrl, newId]);

                newItem.onedriveFolderId = odResult.folderId;
                newItem.onedriveFolderUrl = odResult.webUrl;
            }
        } catch (onedriveError) {
            console.error('OneDrive folder creation failed:', onedriveError.message);
        }

        res.status(201).json(newItem);

        if (req.user) {
            logAction(req.user.userId, req.user.email, 'Create', 'Applications', `Created application ${fileNumber}`, req);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { fileNumber, ...updateData } = req.body;

        const allowedFields = [
            "date", "company", "companyReference", "applicantName",
            "proposedOwner", "currentOwner", "branchName", "propertyAddress",
            "city", "status", "sendToMail"
        ];

        const keys = Object.keys(updateData).filter(k => allowedFields.includes(k));
        if (keys.length > 0) {
            const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
            const values = keys.map(k => updateData[k]);

            await pool.query(`
                UPDATE applications SET ${setClause}, "updatedAt" = NOW() WHERE id = $${keys.length + 1}
            `, [...values, id]);
        }

        const updatedItem = await getApplicationDetails(id);
        res.json(updatedItem);

        if (req.user && updatedItem) {
            logAction(req.user.userId, req.user.email, 'Update', 'Applications', `Updated application ${updatedItem.fileNumber}`, req);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        // Soft delete logic remains same
        const result = await pool.query('UPDATE applications SET status = \'deleted\' WHERE id = $1 RETURNING "fileNumber"', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Not found' });
        }

        if (req.user) {
            logAction(req.user.userId, req.user.email, 'Delete', 'Applications', `Soft deleted application ID ${id}`, req);
        }

        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.bulkDelete = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids)) return res.status(400).json({ message: 'Invalid ids format' });

        await pool.query('UPDATE applications SET status = \'deleted\' WHERE id = ANY($1::bigint[])', [ids]);

        res.json({ message: 'Bulk deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addQuery = async (req, res) => {
    try {
        const appId = parseInt(req.params.id);

        const userResult = await pool.query('SELECT "firstName", "lastName" FROM users WHERE id = $1', [req.user.userId]);
        const currentUser = userResult.rows[0] || { firstName: 'Unknown', lastName: '' };
        const raisedByName = `${currentUser.firstName} ${currentUser.lastName}`.trim();

        // Let DB handle ID generation
        const insertQuery = `
            INSERT INTO application_queries (
                "applicationId", "date", "queryDetails", remarks, "raisedBy", "isResolved"
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `;

        await pool.query(insertQuery, [appId, req.body.date, req.body.queryDetails, req.body.remarks, raisedByName, false]);

        const updatedApp = await getApplicationDetails(appId);
        res.status(201).json(updatedApp);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateQuery = async (req, res) => {
    try {
        const appId = parseInt(req.params.id);
        const queryId = parseInt(req.params.queryId);
        // Update logic remains same, operating on existing ID

        let setClause = [];
        let values = [];
        let paramCount = 1;

        if (req.body.queryDetails !== undefined) {
            setClause.push(`"queryDetails" = $${paramCount++}`);
            values.push(req.body.queryDetails);
        }
        if (req.body.remarks !== undefined) {
            setClause.push(`remarks = $${paramCount++}`);
            values.push(req.body.remarks);
        }
        if (req.body.date !== undefined) {
            setClause.push(`"date" = $${paramCount++}`);
            values.push(req.body.date);
        }

        if (req.body.isResolved !== undefined) {
            setClause.push(`"isResolved" = $${paramCount++}`);
            values.push(req.body.isResolved);

            if (req.body.isResolved) {
                const userResult = await pool.query('SELECT "firstName", "lastName" FROM users WHERE id = $1', [req.user.userId]);
                const currentUser = userResult.rows[0] || { firstName: 'Unknown', lastName: '' };
                const resolvedBy = `${currentUser.firstName} ${currentUser.lastName}`.trim();

                setClause.push(`"resolvedBy" = $${paramCount++}`);
                values.push(resolvedBy);
                setClause.push(`"resolvedDate" = $${paramCount++}`);
                values.push(new Date().toISOString().split('T')[0]);
            } else {
                setClause.push(`"resolvedBy" = $${paramCount++}`);
                values.push(null);
                setClause.push(`"resolvedDate" = $${paramCount++}`);
                values.push(null);
            }
        }

        if (setClause.length === 0) return res.json({ message: 'No changes' });

        const query = `UPDATE application_queries SET ${setClause.join(', ')} WHERE id = $${paramCount} AND "applicationId" = $${paramCount + 1}`;
        await pool.query(query, [...values, queryId, appId]);

        const updatedApp = await getApplicationDetails(appId);
        res.json(updatedApp);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
