const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/companies.json');

const readDb = () => {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return { companies: [], fileLogins: [] };
    }
};

const writeDb = (data) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

exports.getAll = (req, res) => {
    try {
        const db = readDb();
        res.json(db.companies || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = (req, res) => {
    try {
        const db = readDb();
        const item = (db.companies || []).find(x => x.id === parseInt(req.params.id));
        if (!item) return res.status(404).json({ message: 'Not found' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = (req, res) => {
    try {
        const db = readDb();
        if (!db.companies) db.companies = [];

        const newItem = {
            id: Date.now(),
            name: req.body.name,
            emails: req.body.emails || []
        };
        db.companies.push(newItem);
        writeDb(db);
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.update = (req, res) => {
    try {
        const db = readDb();
        const index = (db.companies || []).findIndex(x => x.id === parseInt(req.params.id));
        if (index === -1) return res.status(404).json({ message: 'Not found' });

        db.companies[index] = { ...db.companies[index], ...req.body };
        writeDb(db);
        res.json(db.companies[index]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.delete = (req, res) => {
    try {
        const db = readDb();
        if (!db.companies) return res.status(404).json({ message: 'Not found' });

        const initialLength = db.companies.length;
        db.companies = db.companies.filter(x => x.id !== parseInt(req.params.id));

        if (db.companies.length === initialLength) {
            return res.status(404).json({ message: 'Not found' });
        }

        writeDb(db);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
