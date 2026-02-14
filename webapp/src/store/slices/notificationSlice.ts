import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/axios';

export interface Notification {
    id: number;
    userId: number;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    isRead: boolean;
    link?: string;
    createdAt: string;
}

interface NotificationState {
    items: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
}

const initialState: NotificationState = {
    items: [],
    unreadCount: 0,
    loading: false,
    error: null,
};

export const fetchNotifications = createAsyncThunk('notifications/fetchAll', async () => {
    const response = await api.get('/notifications');
    return response.data; // { notifications: [], unreadCount: 0 }
});

export const markAsRead = createAsyncThunk('notifications/markAsRead', async (id: number) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data.notification;
});

export const markAllAsRead = createAsyncThunk('notifications/markAllAsRead', async () => {
    await api.put('/notifications/read-all');
    return;
});

export const deleteNotification = createAsyncThunk('notifications/delete', async (id: number) => {
    await api.delete(`/notifications/${id}`);
    return id;
});

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        addNotification: (state, action: PayloadAction<Notification>) => {
            state.items.unshift(action.payload);
            state.unreadCount += 1;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.notifications;
                state.unreadCount = action.payload.unreadCount;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch notifications';
            })
            .addCase(markAsRead.fulfilled, (state, action) => {
                const index = state.items.findIndex(n => n.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                    // Recalculate unread count locally or wait for next fetch
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            .addCase(markAllAsRead.fulfilled, (state) => {
                state.items.forEach(n => n.isRead = true);
                state.unreadCount = 0;
            })
            .addCase(deleteNotification.fulfilled, (state, action) => {
                const notification = state.items.find(n => n.id === action.payload);
                if (notification && !notification.isRead) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
                state.items = state.items.filter(n => n.id !== action.payload);
            });
    },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
