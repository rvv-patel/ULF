const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/branches.json');

const readData = () => {
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
};

const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

exports.getAllBranches = (req, res) => {
    try {
        const data = readData();
        res.json(data.branches || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getBranchById = (req, res) => {
    try {
        const data = readData();
        const branch = data.branches.find(b => b.id === parseInt(req.params.id));
        if (!branch) return res.status(404).json({ message: 'Branch not found' });
        res.json(branch);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createBranch = (req, res) => {
    try {
        console.log('Received Create Branch Request');
        console.log('Body:', req.body);
        console.log('File:', req.file);

        const data = readData();
        if (!data.branches) data.branches = [];

        let imageUrl = null;
        if (req.file) {
            imageUrl = `http://localhost:3001/uploads/${req.file.filename}`;
        }

        const newBranch = {
            id: Date.now(),
            name: req.body.name,
            contactPerson: req.body.contactPerson,
            contactNumber: req.body.contactNumber,
            address: req.body.address,
            image: imageUrl
        };

        data.branches.push(newBranch);
        writeData(data);
        res.status(201).json(newBranch);
    } catch (error) {
        console.error('Error creating branch:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.updateBranch = (req, res) => {
    try {
        console.log('Received Update Branch Request:', req.params.id);
        console.log('Body:', req.body);
        console.log('File:', req.file);

        const data = readData();
        const index = data.branches.findIndex(b => b.id === parseInt(req.params.id));

        if (index === -1) return res.status(404).json({ message: 'Branch not found' });

        let imageUrl = data.branches[index].image;
        if (req.file) {
            imageUrl = `http://localhost:3001/uploads/${req.file.filename}`;
        } else if (req.body.image === '') {
            // Explicit removal
            imageUrl = null;
        }

        data.branches[index] = {
            ...data.branches[index],
            name: req.body.name,
            contactPerson: req.body.contactPerson,
            contactNumber: req.body.contactNumber,
            address: req.body.address,
            image: imageUrl
        };

        writeData(data);
        res.json(data.branches[index]);
    } catch (error) {
        console.error('Error updating branch:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.deleteBranch = (req, res) => {
    try {
        const data = readData();
        const initialLength = data.branches ? data.branches.length : 0;
        data.branches = (data.branches || []).filter(b => b.id !== parseInt(req.params.id));

        if (data.branches.length === initialLength) {
            return res.status(404).json({ message: 'Branch not found' });
        }

        writeData(data);
        res.json({ message: 'Branch deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
