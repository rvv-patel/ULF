const express = require('express');
const router = express.Router();
const applicationDocumentController = require('../controllers/applicationDocument.controller');

const { authenticateToken, authorizePermission } = require('../middleware/auth.middleware');

router.use(authenticateToken);

// List with pagination, sorting, filtering
router.get('/', authorizePermission('view_application_documents'), applicationDocumentController.getAll);

// Get single item
router.get('/:id', authorizePermission('view_application_documents'), applicationDocumentController.getById);

// Create
router.post('/', authorizePermission('add_application_documents'), applicationDocumentController.create);

// Update
router.put('/:id', authorizePermission('edit_application_documents'), applicationDocumentController.update);

// Delete
router.delete('/:id', authorizePermission('delete_application_documents'), applicationDocumentController.delete);

// Bulk Delete
router.post('/bulk-delete', authorizePermission('delete_application_documents'), applicationDocumentController.bulkDelete);

module.exports = router;
