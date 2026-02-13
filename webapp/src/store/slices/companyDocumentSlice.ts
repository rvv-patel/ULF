import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { CompanyDocument, CompanyDocumentState } from '../../modules/masters/companyDocument/types';

import api from '../../api/axios';

// Async Thunks
export const fetchCompanyDocuments = createAsyncThunk(
    'companyDocument/fetchCompanyDocuments',
    async (params: {
        page?: number;
        limit?: number;
        search?: string;
        sortBy?: string;
        order?: string;
    } = {}) => {
        const response = await api.get('/company-documents', { params });
        return response.data;
    }
);

export const addCompanyDocument = createAsyncThunk(
    'companyDocument/addCompanyDocument',
    async (document: Omit<CompanyDocument, 'id'>) => {
        const response = await api.post('/company-documents', document);
        return response.data;
    }
);

export const updateCompanyDocument = createAsyncThunk(
    'companyDocument/updateCompanyDocument',
    async (document: CompanyDocument) => {
        const response = await api.put(`/company-documents/${document.id}`, document);
        return response.data;
    }
);

export const deleteCompanyDocument = createAsyncThunk(
    'companyDocument/deleteCompanyDocument',
    async (id: number) => {
        await api.delete(`/company-documents/${id}`);
        return id;
    }
);

export const generateCompanyDocument = createAsyncThunk(
    'companyDocument/generateCompanyDocument',
    async ({ companyName, docType }: { companyName: string; docType: string }, { rejectWithValue }) => {
        try {
            const response = await api.post('/onedrive/create-company-document', { companyName, docType });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Failed to generate document');
        }
    }
);

const initialState: CompanyDocumentState & { totalItems: number; totalPages: number; currentPage: number } = {
    items: [],
    isLoading: false,
    error: null,
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
};

const companyDocumentSlice = createSlice({
    name: 'companyDocument',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchCompanyDocuments.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCompanyDocuments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload.items;
                state.totalItems = action.payload.total;
                state.totalPages = action.payload.totalPages;
                state.currentPage = action.payload.currentPage;
            })
            .addCase(fetchCompanyDocuments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch company documents';
            })
            // Add
            .addCase(addCompanyDocument.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            // Update
            .addCase(updateCompanyDocument.fulfilled, (state, action) => {
                const index = state.items.findIndex((item) => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            // Delete
            .addCase(deleteCompanyDocument.fulfilled, (state, action) => {
                state.items = state.items.filter((item) => item.id !== action.payload);
            });
    },
});

export default companyDocumentSlice.reducer;
