const express = require('express');
const router = express.Router();
const companyController = require('../controllers/company.controller');

const { authenticateToken, authorizePermission } = require('../middleware/auth.middleware');

router.use(authenticateToken);

router.get('/', authorizePermission(['view_companies', 'view_applications', 'add_applications', 'edit_applications']), companyController.getAll);
router.get('/:id', authorizePermission(['view_companies', 'view_applications', 'add_applications', 'edit_applications']), companyController.getById);
router.post('/', authorizePermission('add_companies'), companyController.create);
router.put('/:id', authorizePermission('edit_companies'), companyController.update);
router.delete('/:id', authorizePermission('delete_companies'), companyController.delete);

module.exports = router;
