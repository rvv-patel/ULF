const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken, authorizePermission } = require('../middleware/auth.middleware');

router.use(authenticateToken); // Protect all user routes

router.get('/', authorizePermission('view_users'), userController.getAllUsers);
router.get('/:id', authorizePermission('view_users'), userController.getUserById);
router.post('/', authorizePermission('add_users'), userController.createUser);
router.put('/:id', authorizePermission('edit_users'), userController.updateUser);
router.delete('/:id', authorizePermission('delete_users'), userController.deleteUser);

module.exports = router;
