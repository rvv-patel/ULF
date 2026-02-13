const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branch.controller');
const upload = require('../middleware/upload');

const { authenticateToken, authorizePermission } = require('../middleware/auth.middleware');

router.use(authenticateToken);

router.get('/', authorizePermission('view_branches'), branchController.getAllBranches);
router.get('/:id', authorizePermission('view_branches'), branchController.getBranchById);
router.post('/', authorizePermission('add_branches'), upload.single('image'), branchController.createBranch);
router.put('/:id', authorizePermission('edit_branches'), upload.single('image'), branchController.updateBranch);
router.delete('/:id', authorizePermission('delete_branches'), branchController.deleteBranch);

module.exports = router;
