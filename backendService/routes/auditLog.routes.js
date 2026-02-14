const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLog.controller');
const { authenticateToken, authorizePermission } = require('../middleware/auth.middleware');

// Only users with 'view_audit_logs' permission can view audit logs
router.get('/', authenticateToken, authorizePermission('view_audit_logs'), auditLogController.getLogs);

module.exports = router;
