const CompanyDocumentModel = require('../models/companyDocument.model');

exports.getAll = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            sortBy = '',
            order = 'asc'
        } = req.query;

        const limitNum = parseInt(limit);
        const offset = (parseInt(page) - 1) * limitNum;

        const { items, total } = await CompanyDocumentModel.getAll({
            limit: limitNum,
            offset,
            search,
            sortBy,
            order
        });

        const totalPages = Math.ceil(total / limitNum);

        res.json({
            items,
            total,
            totalPages,
            currentPage: parseInt(page)
        });

    } catch (error) {
        console.error('Error fetching company documents:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const item = await CompanyDocumentModel.getById(parseInt(req.params.id));
        if (!item) return res.status(404).json({ message: 'Not found' });
        res.json(item);
    } catch (error) {
        console.error('Error fetching company document:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const newItem = {
            title: req.body.title || '',
            documentFormat: req.body.documentFormat || '.docx'
        };

        const created = await CompanyDocumentModel.create(newItem);
        res.status(201).json(created);
    } catch (error) {
        console.error('Error creating company document:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const updated = await CompanyDocumentModel.update(parseInt(req.params.id), {
            title: req.body.title,
            documentFormat: req.body.documentFormat
        });

        if (!updated) return res.status(404).json({ message: 'Not found' });

        res.json(updated);
    } catch (error) {
        console.error('Error updating company document:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const deleted = await CompanyDocumentModel.delete(parseInt(req.params.id));

        if (!deleted) {
            return res.status(404).json({ message: 'Not found' });
        }

        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error('Error deleting company document:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.bulkDelete = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids)) return res.status(400).json({ message: 'Invalid ids format' });

        await CompanyDocumentModel.bulkDelete(ids);

        res.json({ message: 'Bulk deleted successfully' });
    } catch (error) {
        console.error('Error bulk deleting company documents:', error);
        res.status(500).json({ error: error.message });
    }
};
