const fs = require('fs');
const path = require('path');
const { logAction } = require('../controllers/auditLog.controller');

const DB_PATH = path.join(__dirname, '../data/applications.json');

// Helper to read DB
const readDb = () => {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return { applications: [] };
    }
};

// Helper to read Users DB for resolving names
const readUsersDb = () => {
    const USERS_PATH = path.join(__dirname, '../data/users.json');
    try {
        const data = fs.readFileSync(USERS_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return { users: [] };
    }
};

// Helper to write DB
const writeDb = (data) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

// Helper: safe string compare
const includesIgnoreCase = (text, term) => {
    return (text || '').toString().toLowerCase().includes((term || '').toLowerCase());
};

exports.getAll = async (req, res) => {
    try {
        const db = readDb();
        let items = db.applications;

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

        // Filtering

        // Role-based filtering: If not Admin, restrict to assigned companies
        if (req.user && req.user.role !== 'Admin') {
            const assignedCompanyIds = req.user.assignedCompanies || [];

            // Use CompanyModel to get company names from PostgreSQL
            let allowedCompanyNames = [];

            try {
                if (assignedCompanyIds.length > 0) {
                    const pool = require('../config/database');
                    const result = await pool.query(
                        'SELECT id, name FROM companies WHERE id = ANY($1::int[])',
                        [assignedCompanyIds]
                    );
                    allowedCompanyNames = result.rows.map(c => c.name);
                    console.log(`[Access Control] User ${req.user.email} can access companies:`, allowedCompanyNames);
                } else {
                    console.log(`[Access Control] User ${req.user.email} has no assigned companies`);
                }
            } catch (err) {
                console.error('Error fetching companies for access control:', err);
                // Fallback: if error, allow none for security
                allowedCompanyNames = [];
            }

            // Apply filter: application.company must be in allowed list
            items = items.filter(item => allowedCompanyNames.includes(item.company));
            console.log(`[Access Control] Filtered to ${items.length} applications for user ${req.user.email}`);
        }

        if (search) {
            items = items.filter(item =>
                includesIgnoreCase(item.applicantName, search) ||
                includesIgnoreCase(item.fileNumber, search) ||
                includesIgnoreCase(item.company, search)
            );
        }

        if (company) {
            items = items.filter(item => item.company === company);
        }

        if (branch) {
            items = items.filter(item => item.branchName === branch);
        }

        if (status) {
            items = items.filter(item => item.status === status);
        }

        if (dateFrom || dateTo) {
            items = items.filter(item => {
                const itemDate = new Date(item.date);
                if (dateFrom && itemDate < new Date(dateFrom)) return false;
                if (dateTo && itemDate > new Date(dateTo)) return false;
                return true;
            });
        }

        // Sorting
        if (sortBy) {
            items.sort((a, b) => {
                const valA = a[sortBy];
                const valB = b[sortBy];

                if (valA === valB) return 0;

                // Handle various types if needed, for now assuming string/number equality works
                const comparison = valA > valB ? 1 : -1;
                return order === 'desc' ? -comparison : comparison;
            });
        }

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const total = items.length;
        const totalPages = Math.ceil(total / limitNum);
        const start = (pageNum - 1) * limitNum;
        const end = start + limitNum;

        const paginatedItems = items.slice(start, end);

        res.json({
            items: paginatedItems,
            total,
            totalPages,
            currentPage: pageNum
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = (req, res) => {
    try {
        const db = readDb();
        const item = db.applications.find(x => x.id === parseInt(req.params.id));
        if (!item) return res.status(404).json({ message: 'Not found' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const AppSettingsModel = require('../models/appSettingsModel');

// Helper: generate unique file number based on settings
const generateFileNumber = async (db) => {
    let fileNumber;
    let isUnique = false;

    // Read current settings from DB
    const settings = await AppSettingsModel.getAll();
    let prefix = settings.fileNumberPrefix || 'ULF';
    let sequence = parseInt(settings.fileNumberSequence) || 1000;
    let padding = parseInt(settings.padding) || 4;

    // Safety break to prevent infinite loops
    let attempts = 0;
    const maxAttempts = 100;

    while (!isUnique && attempts < maxAttempts) {
        const sequenceStr = String(sequence).padStart(padding, '0');
        fileNumber = `${prefix}-${sequenceStr}`;

        isUnique = !db.applications.some(item => item.fileNumber === fileNumber);

        if (!isUnique) {
            // Collision found, increment sequence and try again locally for this loop
            sequence++;
        }
        attempts++;
    }

    if (!isUnique) {
        // Fallback to random if structured generation fails after many attempts
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        fileNumber = `${prefix}-${randomNum}`;
    } else {
        // Success! Update the sequence in appSettings for the NEXT one
        // We save sequence + 1 so the next call gets a new number
        await AppSettingsModel.set('fileNumberSequence', sequence + 1);
    }

    return fileNumber;
};

exports.create = async (req, res) => {
    try {
        const db = readDb();
        const newItem = {
            id: Date.now(), // simple ID generation
            ...req.body,
            fileNumber: await generateFileNumber(db) // Override/Set fileNumber
        };
        db.applications.push(newItem);
        writeDb(db);

        // Attempt to create OneDrive folder (non-blocking if it fails)
        try {
            const onedriveService = require('../services/onedriveService');

            // Only attempt if OneDrive is authenticated
            if (onedriveService.isAuthenticated()) {
                const result = await onedriveService.createApplicationFolder(
                    newItem.fileNumber,
                    newItem.applicantName || 'Unknown Applicant',
                    newItem.company || ''
                );

                // Store OneDrive folder info in application
                newItem.onedriveFolderId = result.folderId;
                newItem.onedriveFolderUrl = result.webUrl;

                // Update DB with OneDrive info
                const updatedDb = readDb();
                const index = updatedDb.applications.findIndex(x => x.id === newItem.id);
                if (index !== -1) {
                    updatedDb.applications[index] = newItem;
                    writeDb(updatedDb);
                }

                console.log(`OneDrive folder created for ${newItem.fileNumber}`);
            } else {
                console.log('OneDrive not authenticated, skipping folder creation');
            }
        } catch (onedriveError) {
            // Log but don't fail the request if OneDrive fails
            console.error('OneDrive folder creation failed:', onedriveError.message);
        }

        res.status(201).json(newItem);

        // Audit Log
        if (req.user) {
            logAction(req.user.userId, req.user.email, 'Create', 'Applications', `Created application ${newItem.fileNumber}`, req);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.update = (req, res) => {
    try {
        const db = readDb();
        const index = db.applications.findIndex(x => x.id === parseInt(req.params.id));
        if (index === -1) return res.status(404).json({ message: 'Not found' });

        // Prevent updating fileNumber if passed (or preserve existing)
        const { fileNumber, ...updateData } = req.body;

        db.applications[index] = { ...db.applications[index], ...updateData };
        writeDb(db);

        // Audit Log
        if (req.user) {
            logAction(req.user.userId, req.user.email, 'Update', 'Applications', `Updated application ${db.applications[index].fileNumber}`, req);
        }

        res.json(db.applications[index]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.delete = (req, res) => {
    try {
        const db = readDb();
        const initialLength = db.applications.length;
        db.applications = db.applications.filter(x => x.id !== parseInt(req.params.id));

        if (db.applications.length === initialLength) {
            return res.status(404).json({ message: 'Not found' });
        }

        writeDb(db);

        // Audit Log
        if (req.user) {
            logAction(req.user.userId, req.user.email, 'Delete', 'Applications', `Deleted application ID ${req.params.id}`, req);
        }

        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.bulkDelete = (req, res) => {
    try {
        const { ids } = req.body; // Expects { ids: [1, 2, 3] }
        if (!Array.isArray(ids)) return res.status(400).json({ message: 'Invalid ids format' });

        const db = readDb();
        db.applications = db.applications.filter(x => !ids.includes(x.id));
        writeDb(db);
        res.json({ message: 'Bulk deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addQuery = (req, res) => {
    try {
        const db = readDb();
        const usersDb = readUsersDb();
        const applicationIndex = db.applications.findIndex(x => x.id === parseInt(req.params.id));
        if (applicationIndex === -1) return res.status(404).json({ message: 'Application not found' });

        const currentUser = usersDb.users.find(u => u.id === req.user.userId) || { firstName: 'Unknown', lastName: '' };
        const raisedByName = `${currentUser.firstName} ${currentUser.lastName}`.trim();

        const newQuery = {
            id: Date.now(),
            date: req.body.date,
            queryDetails: req.body.queryDetails,
            remarks: req.body.remarks,
            raisedBy: raisedByName,
            isResolved: false,
            resolvedBy: null,
            resolvedDate: null
        };

        if (!db.applications[applicationIndex].queries) {
            db.applications[applicationIndex].queries = [];
        }

        db.applications[applicationIndex].queries.push(newQuery);
        writeDb(db);
        res.status(201).json(db.applications[applicationIndex]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateQuery = (req, res) => {
    try {
        const db = readDb();
        const usersDb = readUsersDb();
        const applicationIndex = db.applications.findIndex(x => x.id === parseInt(req.params.id));
        if (applicationIndex === -1) return res.status(404).json({ message: 'Application not found' });

        const application = db.applications[applicationIndex];
        if (!application.queries) return res.status(404).json({ message: 'Query not found' });

        const queryIndex = application.queries.findIndex(q => q.id === parseInt(req.params.queryId));
        if (queryIndex === -1) return res.status(404).json({ message: 'Query not found' });

        const query = application.queries[queryIndex];

        // Update fields if provided
        if (req.body.queryDetails !== undefined) query.queryDetails = req.body.queryDetails;
        if (req.body.remarks !== undefined) query.remarks = req.body.remarks;
        if (req.body.date !== undefined) query.date = req.body.date;

        // Handle Resolution
        if (req.body.isResolved !== undefined) {
            query.isResolved = req.body.isResolved;
            if (query.isResolved) {
                const currentUser = usersDb.users.find(u => u.id === req.user.userId) || { firstName: 'Unknown', lastName: '' };
                query.resolvedBy = `${currentUser.firstName} ${currentUser.lastName}`.trim();
                query.resolvedDate = new Date().toISOString().split('T')[0];
            } else {
                query.resolvedBy = null;
                query.resolvedDate = null;
            }
        }

        db.applications[applicationIndex].queries[queryIndex] = query;
        writeDb(db);
        res.json(db.applications[applicationIndex]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
