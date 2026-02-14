const fs = require('fs');
const path = require('path');

const LOGS_FILE = path.join(__dirname, '../data/auditLogs.json');

// Helper to read logs
const readLogs = () => {
    if (!fs.existsSync(LOGS_FILE)) {
        return [];
    }
    try {
        const data = fs.readFileSync(LOGS_FILE);
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
};

// Helper to write logs
const writeLogs = (logs) => {
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2));
};

// Exported helper to log an action (to be used by other controllers)
exports.logAction = (userId, userName, action, module, details, req) => {
    try {
        const logs = readLogs();
        const newLog = {
            id: Date.now(),
            userId,
            userName,
            action,
            module,
            details,
            timestamp: new Date().toISOString(),
            ipAddress: req?.ip || req?.connection?.remoteAddress || 'unknown'
        };
        // Add to beginning of array
        logs.unshift(newLog);

        // Optional: Limit log size (e.g., keep last 1000 logs)
        if (logs.length > 2000) {
            logs.length = 2000;
        }

        writeLogs(logs);
    } catch (error) {
        console.error('Failed to write audit log:', error);
    }
};

// API Endpoint to get logs (Admin only)
exports.getLogs = (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search ? req.query.search.toLowerCase() : '';
        const moduleFilter = req.query.module || '';

        let logs = readLogs();

        // Filter
        if (search) {
            logs = logs.filter(log =>
                log.userName.toLowerCase().includes(search) ||
                log.action.toLowerCase().includes(search) ||
                log.details.toLowerCase().includes(search)
            );
        }
        if (moduleFilter) {
            logs = logs.filter(log => log.module === moduleFilter);
        }

        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = logs.length;
        const paginatedLogs = logs.slice(startIndex, endIndex);

        res.json({
            logs: paginatedLogs,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
