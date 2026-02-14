const BranchModel = require('../models/branchModel');

/**
 * Get all branches
 */
exports.getAllBranches = async (req, res) => {
    try {
        const branches = await BranchModel.getAll();
        res.json(branches);
    } catch (error) {
        console.error('Error fetching branches:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get branch by ID
 */
exports.getBranchById = async (req, res) => {
    try {
        const branch = await BranchModel.getById(parseInt(req.params.id));

        if (!branch) {
            return res.status(404).json({ message: 'Branch not found' });
        }

        res.json(branch);
    } catch (error) {
        console.error('Error fetching branch:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Create new branch
 */
exports.createBranch = async (req, res) => {
    try {
        console.log('Received Create Branch Request');
        console.log('Body:', req.body);
        console.log('File:', req.file);

        let imageUrl = null;
        if (req.file) {
            imageUrl = `http://localhost:3001/uploads/${req.file.filename}`;
        }

        const newBranch = {
            id: Date.now(), // Generate ID
            name: req.body.name,
            contactPerson: req.body.contactPerson,
            contactNumber: req.body.contactNumber,
            address: req.body.address,
            image: imageUrl
        };

        const created = await BranchModel.create(newBranch);
        res.status(201).json(created);
    } catch (error) {
        console.error('Error creating branch:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Update branch
 */
exports.updateBranch = async (req, res) => {
    try {
        console.log('Received Update Branch Request:', req.params.id);
        console.log('Body:', req.body);
        console.log('File:', req.file);

        const branchId = parseInt(req.params.id);

        // Get existing branch to preserve image if no new upload
        const existing = await BranchModel.getById(branchId);
        if (!existing) {
            return res.status(404).json({ message: 'Branch not found' });
        }

        let imageUrl = existing.image;
        if (req.file) {
            imageUrl = `http://localhost:3001/uploads/${req.file.filename}`;
        } else if (req.body.image === '') {
            // Explicit removal
            imageUrl = null;
        }

        const updates = {
            name: req.body.name,
            contactPerson: req.body.contactPerson,
            contactNumber: req.body.contactNumber,
            address: req.body.address,
            image: imageUrl
        };

        const updated = await BranchModel.update(branchId, updates);
        res.json(updated);
    } catch (error) {
        console.error('Error updating branch:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Delete branch
 */
exports.deleteBranch = async (req, res) => {
    try {
        const deleted = await BranchModel.delete(parseInt(req.params.id));

        if (!deleted) {
            return res.status(404).json({ message: 'Branch not found' });
        }

        res.json({ message: 'Branch deleted successfully', branch: deleted });
    } catch (error) {
        console.error('Error deleting branch:', error);
        res.status(500).json({ message: error.message });
    }
};
