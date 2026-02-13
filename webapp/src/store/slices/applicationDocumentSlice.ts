import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { ApplicationDocument, ApplicationDocumentState } from '../../modules/masters/applicationDocument/types';

import api from '../../api/axios';

// Async Thunks
export const fetchApplicationDocuments = createAsyncThunk(
    'applicationDocument/fetchApplicationDocuments',
    async (params: {
        page?: number;
        limit?: number;
        search?: string;
        sortBy?: string;
        order?: string;
    } = {}) => {
        const response = await api.get('/application-documents', { params });
        return response.data;
    }
);

export const addApplicationDocument = createAsyncThunk(
    'applicationDocument/addApplicationDocument',
    async (document: Omit<ApplicationDocument, 'id'>) => {
        const response = await api.post('/application-documents', document);
        return response.data;
    }
);

export const updateApplicationDocument = createAsyncThunk(
    'applicationDocument/updateApplicationDocument',
    async (document: ApplicationDocument) => {
        const response = await api.put(`/application-documents/${document.id}`, document);
        return response.data;
    }
);

export const deleteApplicationDocument = createAsyncThunk(
    'applicationDocument/deleteApplicationDocument',
    async (id: number) => {
        await api.delete(`/application-documents/${id}`);
        return id;
    }
);

export const deleteApplicationDocuments = createAsyncThunk(
    'applicationDocument/deleteApplicationDocuments',
    async (ids: number[]) => {
        const response = await api.post('/application-documents/bulk-delete', { ids });
        return ids;
    }
);

const initialState: ApplicationDocumentState & { totalItems: number; totalPages: number; currentPage: number } = {
    items: [],
    isLoading: false,
    error: null,
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
};

const applicationDocumentSlice = createSlice({
    name: 'applicationDocument',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchApplicationDocuments.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchApplicationDocuments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload.items;
                state.totalItems = action.payload.total;
                state.totalPages = action.payload.totalPages;
                state.currentPage = action.payload.currentPage;
            })
            .addCase(fetchApplicationDocuments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch application documents';
            })
            // Add
            .addCase(addApplicationDocument.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            // Update
            .addCase(updateApplicationDocument.fulfilled, (state, action) => {
                const index = state.items.findIndex((item) => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            // Delete
            .addCase(deleteApplicationDocument.fulfilled, (state, action) => {
                state.items = state.items.filter((item) => item.id !== action.payload);
            })
            // Bulk Delete
            .addCase(deleteApplicationDocuments.fulfilled, (state, action) => {
                state.items = state.items.filter((item) => !action.payload.includes(item.id));
            });
    },
});

export default applicationDocumentSlice.reducer;
