const pool = require('../config/database');

class NotificationModel {
    static async create(notificationData) {
        try {
            const { userId, title, message, type = 'info', link } = notificationData;

            const query = `
                INSERT INTO notifications ("userId", "title", "message", "type", "link", "isRead", "createdAt")
                VALUES ($1, $2, $3, $4, $5, FALSE, NOW())
                RETURNING *
            `;

            const result = await pool.query(query, [userId, title, message, type, link]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async getByUserId(userId) {
        try {
            // Get unread first, then recent read ones (limit 50 total)
            const query = `
                SELECT * FROM notifications 
                WHERE "userId" = $1 
                ORDER BY "isRead" ASC, "createdAt" DESC
                LIMIT 50
            `;
            const result = await pool.query(query, [userId]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    static async getUnreadCount(userId) {
        try {
            const query = `
                SELECT COUNT(*) as count FROM notifications 
                WHERE "userId" = $1 AND "isRead" = FALSE
            `;
            const result = await pool.query(query, [userId]);
            return parseInt(result.rows[0].count);
        } catch (error) {
            throw error;
        }
    }

    static async markAsRead(id, userId) {
        try {
            const query = `
                UPDATE notifications 
                SET "isRead" = TRUE 
                WHERE id = $1 AND "userId" = $2
                RETURNING *
            `;
            const result = await pool.query(query, [id, userId]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async markAllAsRead(userId) {
        try {
            const query = `
                UPDATE notifications 
                SET "isRead" = TRUE 
                WHERE "userId" = $1 AND "isRead" = FALSE
            `;
            await pool.query(query, [userId]);
            return true;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id, userId) {
        try {
            const query = `
                DELETE FROM notifications 
                WHERE id = $1 AND "userId" = $2
                RETURNING *
            `;
            const result = await pool.query(query, [id, userId]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
}

module.exports = NotificationModel;
