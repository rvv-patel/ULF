import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchNotifications, markAsRead, markAllAsRead, deleteNotification, type Notification } from '../../store/slices/notificationSlice';
import { Check, Trash2, X, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
    const dispatch = useAppDispatch();
    const { items: notifications, unreadCount, loading } = useAppSelector(state => state.notifications);

    useEffect(() => {
        if (isOpen) {
            dispatch(fetchNotifications());
        }
    }, [isOpen, dispatch]);

    const handleMarkAsRead = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        dispatch(markAsRead(id));
    };

    const handleDelete = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        dispatch(deleteNotification(id));
    };

    const handleMarkAllRead = () => {
        dispatch(markAllAsRead());
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
            default: return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-10" onClick={onClose}></div>
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            You have {unreadCount} unread messages
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 bg-blue-50 rounded hover:bg-blue-100 transition-colors flex items-center gap-1"
                        >
                            <Check className="h-3 w-3" />
                            Mark all read
                        </button>
                    )}
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                    {loading && notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-gray-50 transition-colors relative group ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
                                >
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-0.5 break-words">
                                                {notification.message}
                                            </p>
                                            {notification.link && (
                                                <a
                                                    href={notification.link}
                                                    className="inline-block mt-2 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    View Details →
                                                </a>
                                            )}
                                            <p className="text-xs text-gray-400 mt-2">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!notification.isRead && (
                                                <button
                                                    onClick={(e) => handleMarkAsRead(e, notification.id)}
                                                    className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-blue-600"
                                                    title="Mark as read"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => handleDelete(e, notification.id)}
                                                className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-red-500"
                                                title="Delete"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
