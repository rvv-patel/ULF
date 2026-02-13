const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/permissions.json');

const readData = () => {
    if (!fs.existsSync(DATA_FILE)) {
        return { permissions: [] };
    }
    const data = fs.readFileSync(DATA_FILE);
    try {
        return JSON.parse(data);
    } catch (e) {
        return { permissions: [] };
    }
};

exports.getAllPermissions = (req, res) => {
    try {
        const data = readData();
        res.json(data.permissions || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
