const AppSettingsModel = require('../models/appSettingsModel');

// Get current settings
exports.getSettings = async (req, res) => {
    try {
        const settings = await AppSettingsModel.getAll();
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update settings
exports.updateSettings = async (req, res) => {
    try {
        const updates = req.body;
        const currentSettings = await AppSettingsModel.getAll();

        // Merge updates
        const newSettings = { ...currentSettings, ...updates };

        await AppSettingsModel.setMany(newSettings);

        res.json({ message: 'Settings updated successfully', settings: newSettings });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: error.message });
    }
};
