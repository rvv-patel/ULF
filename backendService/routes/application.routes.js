const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/application.controller');

const { authenticateToken, authorizePermission } = require('../middleware/auth.middleware');

router.use(authenticateToken);

// List with pagination, sorting, filtering
router.get('/', authorizePermission('view_applications'), applicationController.getAll);

// Get single item
router.get('/:id', authorizePermission('view_applications'), applicationController.getById);

// Create
router.post('/', authorizePermission('add_applications'), applicationController.create);

// Update
router.put('/:id', authorizePermission('edit_applications'), applicationController.update);

// Delete
router.delete('/:id', authorizePermission('delete_applications'), applicationController.delete);

// Bulk Delete
router.post('/bulk-delete', authorizePermission('delete_applications'), applicationController.bulkDelete);

// Queries
router.post('/:id/queries', authorizePermission('edit_applications'), applicationController.addQuery);
router.patch('/:id/queries/:queryId', authorizePermission('edit_applications'), applicationController.updateQuery);

module.exports = router;
