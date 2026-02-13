const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/companyDocuments.json');

// Helper to read DB
const readDb = () => {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return { companyDocuments: [] };
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

exports.getAll = (req, res) => {
    try {
        const db = readDb();
        let items = db.companyDocuments || [];

        const {
            page = 1,
            limit = 10,
            search = '',
            sortBy = '',
            order = 'asc'
        } = req.query;

        // Filtering
        if (search) {
            items = items.filter(item =>
                includesIgnoreCase(item.title, search) ||
                includesIgnoreCase(item.documentFormat, search)
            );
        }

        // Sorting
        if (sortBy) {
            items.sort((a, b) => {
                const valA = a[sortBy];
                const valB = b[sortBy];

                if (valA === valB) return 0;

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
        const item = (db.companyDocuments || []).find(x => x.id === parseInt(req.params.id));
        if (!item) return res.status(404).json({ message: 'Not found' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = (req, res) => {
    try {
        const db = readDb();
        if (!db.companyDocuments) db.companyDocuments = [];

        const newItem = {
            id: Date.now(),
            title: req.body.title || '',
            documentFormat: req.body.documentFormat || '.docx',
            isUploaded: req.body.isUploaded || false,
            isGenerate: req.body.isGenerate || false
        };

        db.companyDocuments.push(newItem);
        writeDb(db);
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.update = (req, res) => {
    try {
        const db = readDb();
        if (!db.companyDocuments) db.companyDocuments = [];

        const index = db.companyDocuments.findIndex(x => x.id === parseInt(req.params.id));
        if (index === -1) return res.status(404).json({ message: 'Not found' });

        db.companyDocuments[index] = {
            ...db.companyDocuments[index],
            ...req.body,
            id: db.companyDocuments[index].id
        };
        writeDb(db);
        res.json(db.companyDocuments[index]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.delete = (req, res) => {
    try {
        const db = readDb();
        if (!db.companyDocuments) db.companyDocuments = [];

        const initialLength = db.companyDocuments.length;
        db.companyDocuments = db.companyDocuments.filter(x => x.id !== parseInt(req.params.id));

        if (db.companyDocuments.length === initialLength) {
            return res.status(404).json({ message: 'Not found' });
        }

        writeDb(db);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.bulkDelete = (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids)) return res.status(400).json({ message: 'Invalid ids format' });

        const db = readDb();
        if (!db.companyDocuments) db.companyDocuments = [];

        db.companyDocuments = db.companyDocuments.filter(x => !ids.includes(x.id));
        writeDb(db);
        res.json({ message: 'Bulk deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
