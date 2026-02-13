import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import api from '../../api/axios';

export const fetchCompanies = createAsyncThunk(
    'company/fetchCompanies',
    async () => {
        const response = await api.get('/companies');
        return response.data;
    }
);

export const addCompany = createAsyncThunk(
    'company/addCompany',
    async (company: { name: string; emails: string[] }) => {
        const response = await api.post('/companies', company);
        return response.data;
    }
);

export const updateCompany = createAsyncThunk(
    'company/updateCompany',
    async (company: { id: number; name: string; emails: string[] }) => {
        const response = await api.put(`/companies/${company.id}`, company);
        return response.data;
    }
);

export const deleteCompany = createAsyncThunk(
    'company/deleteCompany',
    async (id: number) => {
        await api.delete(`/companies/${id}`);
        return id;
    }
);

export interface Company {
    id: number;
    name: string;
    emails: string[];
}

interface CompanyState {
    items: Company[];
    isLoading: boolean;
    error: string | null;
}

const initialState: CompanyState = {
    items: [],
    isLoading: false,
    error: null,
};

const companySlice = createSlice({
    name: 'company',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCompanies.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCompanies.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload;
            })
            .addCase(fetchCompanies.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch companies';
            })
            .addCase(addCompany.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            .addCase(updateCompany.fulfilled, (state, action) => {
                const index = state.items.findIndex(item => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(deleteCompany.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item.id !== action.payload);
            });
    },
});

export default companySlice.reducer;
