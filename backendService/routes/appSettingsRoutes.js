const express = require('express');
const router = express.Router();
const appSettingsController = require('../controllers/appSettingsController');

router.get('/', appSettingsController.getSettings);
router.put('/', appSettingsController.updateSettings);

module.exports = router;
