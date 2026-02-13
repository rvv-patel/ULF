const express = require('express');
const router = express.Router();
const companyDocumentController = require('../controllers/companyDocument.controller');

const { authenticateToken, authorizePermission } = require('../middleware/auth.middleware');

router.use(authenticateToken);

// List with pagination, sorting, filtering
router.get('/', authorizePermission('view_company_documents'), companyDocumentController.getAll);

// Get single item
router.get('/:id', authorizePermission('view_company_documents'), companyDocumentController.getById);

// Create
router.post('/', authorizePermission('add_company_documents'), companyDocumentController.create);

// Update
router.put('/:id', authorizePermission('edit_company_documents'), companyDocumentController.update);

// Delete
router.delete('/:id', authorizePermission('delete_company_documents'), companyDocumentController.delete);

// Bulk Delete
router.post('/bulk-delete', authorizePermission('delete_company_documents'), companyDocumentController.bulkDelete);

module.exports = router;
