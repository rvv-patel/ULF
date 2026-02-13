import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { User, UserState } from '../../modules/user/types';

import api from '../../api/axios';

// Async Thunks
export const fetchUsers = createAsyncThunk('user/fetchUsers', async () => {
    const response = await api.get('/users');
    return response.data;
});

export const addUser = createAsyncThunk('user/addUser', async (userData: Omit<User, 'id'>) => {
    const response = await api.post('/users', userData);
    return response.data;
});

export const updateUser = createAsyncThunk('user/updateUser', async (userData: User) => {
    const response = await api.put(`/users/${userData.id}`, userData);
    return response.data;
});

export const deleteUser = createAsyncThunk('user/deleteUser', async (id: number) => {
    await api.delete(`/users/${id}`);
    return id;
});

const initialState: UserState = {
    items: [],
    loading: false,
    error: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        // We can keep these if we want manual state updates, but thunks usually handle it.
        // Clearing them to rely on thunks.
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch users';
            })
            // Add
            .addCase(addUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false;
                state.items.unshift(action.payload);
            })
            .addCase(addUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to add user';
            })
            // Update
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false;
                const index = state.items.findIndex(user => user.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update user';
            })
            // Delete
            .addCase(deleteUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action: PayloadAction<number>) => {
                state.loading = false;
                state.items = state.items.filter(user => user.id !== action.payload);
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to delete user';
            });
    },
});

export default userSlice.reducer;
