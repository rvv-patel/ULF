import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Application, ApplicationState } from '../../modules/application/types';

import api from '../../api/axios';

// Async Thunks
export const fetchApplications = createAsyncThunk(
    'application/fetchApplications',
    async (params: {
        page?: number;
        limit?: number;
        search?: string;
        sortBy?: string;
        order?: string;
        company?: string;
        branch?: string;
        status?: string;
        dateFrom?: string;
        dateTo?: string;
    } = {}) => {
        const response = await api.get('/applications', { params });
        return response.data; // Returns { items, total, totalPages, currentPage }
    }
);

export const addApplication = createAsyncThunk(
    'application/addApplication',
    async (application: Omit<Application, 'id'>) => {
        const response = await api.post('/applications', application);
        return response.data;
    }
);

export const updateApplication = createAsyncThunk(
    'application/updateApplication',
    async (application: Application) => {
        const response = await api.put(`/applications/${application.id}`, application);
        return response.data;
    }
);

export const deleteApplication = createAsyncThunk(
    'application/deleteApplication',
    async (id: number) => {
        await api.delete(`/applications/${id}`);
        return id;
    }
);

export const deleteApplications = createAsyncThunk(
    'application/deleteApplications',
    async (ids: number[]) => {
        const response = await api.post('/applications/bulk-delete', { ids });
        return ids;
    }
);

export const fetchApplicationById = createAsyncThunk(
    'application/fetchApplicationById',
    async (id: number) => {
        const response = await api.get(`/applications/${id}`);
        return response.data;
    }
);

export const addQuery = createAsyncThunk(
    'application/addQuery',
    async ({ id, query }: { id: number; query: any }) => {
        const response = await api.post(`/applications/${id}/queries`, query);
        return response.data;
    }
);

export const updateQuery = createAsyncThunk(
    'application/updateQuery',
    async ({ id, queryId, updates }: { id: number; queryId: number; updates: any }) => {
        const response = await api.patch(`/applications/${id}/queries/${queryId}`, updates);
        return response.data;
    }
);

const initialState: ApplicationState & {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    currentApplication: Application | null;
} = {
    items: [],
    isLoading: false,
    error: null,
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    currentApplication: null,
};

const applicationSlice = createSlice({
    name: 'application',
    initialState,
    reducers: {
        clearCurrentApplication: (state) => {
            state.currentApplication = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchApplications.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchApplications.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload.items;
                state.totalItems = action.payload.total;
                state.totalPages = action.payload.totalPages;
                state.currentPage = action.payload.currentPage;
            })
            .addCase(fetchApplications.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch messages';
            })
            // Fetch Single
            .addCase(fetchApplicationById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchApplicationById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentApplication = action.payload;
            })
            .addCase(fetchApplicationById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch application';
            })
            .addCase(addQuery.fulfilled, (state, action) => {
                state.currentApplication = action.payload; // Payload is the updated application
            })
            .addCase(updateQuery.fulfilled, (state, action) => {
                state.currentApplication = action.payload; // Payload is the updated application
            })
            // Add
            .addCase(addApplication.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            // Update
            .addCase(updateApplication.fulfilled, (state, action) => {
                const index = state.items.findIndex((item) => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                if (state.currentApplication && state.currentApplication.id === action.payload.id) {
                    state.currentApplication = action.payload;
                }
            })
            // Delete
            .addCase(deleteApplication.fulfilled, (state, action) => {
                state.items = state.items.filter((item) => item.id !== action.payload);
                if (state.currentApplication && state.currentApplication.id === action.payload) {
                    state.currentApplication = null;
                }
            })
            // Bulk Delete
            .addCase(deleteApplications.fulfilled, (state, action) => {
                state.items = state.items.filter((item) => !action.payload.includes(item.id));
            });
    },
});

export const { clearCurrentApplication } = applicationSlice.actions;
export default applicationSlice.reducer;
