const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/roles.json');

const readData = () => {
    if (!fs.existsSync(DATA_FILE)) {
        return { roles: [] };
    }
    const data = fs.readFileSync(DATA_FILE);
    try {
        return JSON.parse(data);
    } catch (e) {
        return { roles: [] };
    }
};

const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

exports.getAllRoles = (req, res) => {
    try {
        const data = readData();
        res.json(data.roles || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRoleById = (req, res) => {
    try {
        const data = readData();
        const role = (data.roles || []).find(r => r.id === parseInt(req.params.id));
        if (!role) return res.status(404).json({ message: 'Role not found' });
        res.json(role);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createRole = (req, res) => {
    try {
        const data = readData();
        if (!data.roles) data.roles = [];

        const newRole = {
            id: Date.now(),
            ...req.body,
            userCount: req.body.userCount || 0
        };

        data.roles.push(newRole);
        writeData(data);
        res.status(201).json(newRole);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateRole = (req, res) => {
    try {
        const data = readData();
        if (!data.roles) return res.status(404).json({ message: 'Role not found' });

        const index = data.roles.findIndex(r => r.id === parseInt(req.params.id));
        if (index === -1) return res.status(404).json({ message: 'Role not found' });

        // Merge existing role with updates
        data.roles[index] = {
            ...data.roles[index],
            ...req.body,
            id: data.roles[index].id // Prevent ID update
        };

        writeData(data);
        res.json(data.roles[index]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteRole = (req, res) => {
    try {
        const data = readData();
        if (!data.roles) return res.status(404).json({ message: 'Role not found' });

        const initialLength = data.roles.length;
        data.roles = data.roles.filter(r => r.id !== parseInt(req.params.id));

        if (data.roles.length === initialLength) {
            return res.status(404).json({ message: 'Role not found' });
        }

        writeData(data);
        res.json({ message: 'Role deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
