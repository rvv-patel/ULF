const NotificationModel = require('../models/notificationModel');

exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.userId;
        const notifications = await NotificationModel.getByUserId(userId);
        const unreadCount = await NotificationModel.getUnreadCount(userId);

        res.json({
            notifications,
            unreadCount
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const userId = req.user.userId;
        const notificationId = parseInt(req.params.id);

        const updated = await NotificationModel.markAsRead(notificationId, userId);

        if (!updated) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification marked as read', notification: updated });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ message: 'Failed to update notification' });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.userId;
        await NotificationModel.markAllAsRead(userId);
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ message: 'Failed to update notifications' });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const userId = req.user.userId;
        const notificationId = parseInt(req.params.id);

        const deleted = await NotificationModel.delete(notificationId, userId);

        if (!deleted) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ message: 'Failed to delete notification' });
    }
};

// Helper for other controllers to create notifications
exports.createNotification = async (userId, title, message, type = 'info', link = null) => {
    try {
        return await NotificationModel.create({
            userId,
            title,
            message,
            type,
            link
        });
    } catch (error) {
        console.error('Create notification error:', error);
        return null; // Don't crash valid operations if notification fails
    }
};
