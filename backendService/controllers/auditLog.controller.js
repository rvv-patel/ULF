const pool = require('../config/database');

// Helper to write logs
// const writeLogs = (logs) => {
//     fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2));
// };

// Exported helper to log an action (to be used by other controllers)
exports.logAction = async (userId, userName, action, module, details, req) => {
    try {
        const query = `
            INSERT INTO audit_logs ("userId", "userName", "action", "module", "details", "ipAddress", "timestamp")
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
        `;
        const ipAddress = req?.ip || req?.connection?.remoteAddress || 'unknown';
        await pool.query(query, [userId, userName, action, module, details, ipAddress]);
    } catch (error) {
        console.error('Failed to write audit log:', error);
    }
};

// API Endpoint to get logs (Admin only)
exports.getLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search ? req.query.search.toLowerCase() : '';
        const moduleFilter = req.query.module || '';

        let query = 'SELECT * FROM audit_logs WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) FROM audit_logs WHERE 1=1';
        const queryParams = [];
        let paramCount = 1;

        if (search) {
            query += ` AND (LOWER("userName") LIKE $${paramCount} OR LOWER("action") LIKE $${paramCount} OR LOWER("details") LIKE $${paramCount})`;
            countQuery += ` AND (LOWER("userName") LIKE $${paramCount} OR LOWER("action") LIKE $${paramCount} OR LOWER("details") LIKE $${paramCount})`;
            queryParams.push(`%${search}%`);
            paramCount++;
        }

        if (moduleFilter) {
            query += ` AND "module" = $${paramCount}`;
            countQuery += ` AND "module" = $${paramCount}`;
            queryParams.push(moduleFilter);
            paramCount++;
        }

        // Add order by
        query += ' ORDER BY "timestamp" DESC';

        // Add pagination
        const offset = (page - 1) * limit;
        query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;

        const totalResult = await pool.query(countQuery, queryParams);
        const total = parseInt(totalResult.rows[0].count);

        const logsResult = await pool.query(query, [...queryParams, limit, offset]);

        res.json({
            logs: logsResult.rows,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
