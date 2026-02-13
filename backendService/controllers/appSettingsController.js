const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/appSettings.json');

// Helper to read data
const readData = () => {
    try {
        if (!fs.existsSync(dataPath)) {
            // Return default if file doesn't exist
            return {
                businessName: "",
                businessEmail: "",
                defaultCC: "",
                replyTo: "",
                maintenanceMode: false
            };
        }
        const data = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading app settings:', error);
        return null;
    }
};

// Helper to write data
const writeData = (data) => {
    try {
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing app settings:', error);
        return false;
    }
};

exports.getSettings = (req, res) => {
    try {
        const settings = readData();
        if (!settings) {
            return res.status(500).json({ message: 'Error retrieving settings' });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateSettings = (req, res) => {
    try {
        const currentSettings = readData() || {};
        const newSettings = { ...currentSettings, ...req.body };

        if (writeData(newSettings)) {
            res.json(newSettings);
        } else {
            res.status(500).json({ message: 'Error saving settings' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
