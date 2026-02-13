const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');

const { authenticateToken, authorizePermission } = require('../middleware/auth.middleware');

router.use(authenticateToken);

router.get('/', authorizePermission('view_roles'), roleController.getAllRoles);
router.get('/:id', authorizePermission('view_roles'), roleController.getRoleById);
router.post('/', authorizePermission('add_roles'), roleController.createRole);
router.put('/:id', authorizePermission('edit_roles'), roleController.updateRole);
router.delete('/:id', authorizePermission('delete_roles'), roleController.deleteRole);

module.exports = router;
