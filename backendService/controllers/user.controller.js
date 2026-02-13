const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_FILE = path.join(__dirname, '../data/users.json');

const readData = () => {
    if (!fs.existsSync(DATA_FILE)) {
        return { users: [] };
    }
    const data = fs.readFileSync(DATA_FILE);
    try {
        return JSON.parse(data);
    } catch (e) {
        return { users: [] };
    }
};

const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

exports.getAllUsers = (req, res) => {
    try {
        const data = readData();
        res.json(data.users || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserById = (req, res) => {
    try {
        const data = readData();
        const user = (data.users || []).find(u => u.id === parseInt(req.params.id));
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const data = readData();
        if (!data.users) data.users = [];

        const plainPassword = req.body.password || 'Password@123';
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const newUser = {
            id: Date.now(),
            ...req.body,
            password: hashedPassword,
            // Ensure these fields are set if not provided
            dateJoined: req.body.dateJoined || new Date().toISOString().split('T')[0],
            status: req.body.status || 'active',
            permissions: req.body.permissions || []
        };

        data.users.unshift(newUser); // Add to beginning
        writeData(data);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateUser = (req, res) => {
    try {
        const data = readData();
        if (!data.users) return res.status(404).json({ message: 'User not found' });

        const index = data.users.findIndex(u => u.id === parseInt(req.params.id));
        if (index === -1) return res.status(404).json({ message: 'User not found' });

        // Merge existing user with updates
        data.users[index] = {
            ...data.users[index],
            ...req.body,
            id: data.users[index].id // Prevent ID update
        };

        writeData(data);
        res.json(data.users[index]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteUser = (req, res) => {
    try {
        const data = readData();
        if (!data.users) return res.status(404).json({ message: 'User not found' });

        const initialLength = data.users.length;
        data.users = data.users.filter(u => u.id !== parseInt(req.params.id));

        if (data.users.length === initialLength) {
            return res.status(404).json({ message: 'User not found' });
        }

        writeData(data);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
