import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Role, RoleState, Permission } from '../../modules/role/types';

import api from '../../api/axios';

// Async Thunks
export const fetchPermissions = createAsyncThunk('role/fetchPermissions', async () => {
    const response = await api.get('/permissions');
    return response.data.permissions || [];
});

export const fetchRoles = createAsyncThunk('role/fetchRoles', async () => {
    const response = await api.get('/roles');
    return response.data.roles || [];
});

export const addRole = createAsyncThunk('role/addRole', async (roleData: Omit<Role, 'id' | 'userCount'>) => {
    // Note: userCount is typically calculated by backend or 0 for new roles
    const payload = { ...roleData, userCount: 0 };
    const response = await api.post('/roles', payload);
    return response.data;
});

export const updateRole = createAsyncThunk('role/updateRole', async (roleData: Role) => {
    const response = await api.put(`/roles/${roleData.id}`, roleData);
    return response.data;
});

export const deleteRole = createAsyncThunk('role/deleteRole', async (id: number) => {
    await api.delete(`/roles/${id}`);
    return id;
});

const initialState: RoleState = {
    items: [],
    permissions: [],
    loading: false,
    error: null,
};

const roleSlice = createSlice({
    name: 'role',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchRoles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRoles.fulfilled, (state, action: PayloadAction<Role[]>) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchRoles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch roles';
            })
            // Add
            .addCase(addRole.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addRole.fulfilled, (state, action: PayloadAction<Role>) => {
                state.loading = false;
                state.items.push(action.payload);
            })
            .addCase(addRole.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to add role';
            })
            // Update
            .addCase(updateRole.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateRole.fulfilled, (state, action: PayloadAction<Role>) => {
                state.loading = false;
                const index = state.items.findIndex(role => role.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(updateRole.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update role';
            })
            // Delete
            .addCase(deleteRole.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteRole.fulfilled, (state, action: PayloadAction<number>) => {
                state.loading = false;
                state.items = state.items.filter(role => role.id !== action.payload);
            })
            .addCase(deleteRole.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to delete role';
            })
            // Fetch Permissions
            .addCase(fetchPermissions.fulfilled, (state, action: PayloadAction<Permission[]>) => {
                state.permissions = action.payload;
            });
    },
});

export default roleSlice.reducer;
