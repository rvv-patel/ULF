import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Branch } from '../../modules/masters/branch/types';

import api from '../../api/axios';

// Async Thunks
export const fetchBranches = createAsyncThunk('branch/fetchBranches', async () => {
    const response = await api.get('/branches');
    return response.data;
});

export const addBranch = createAsyncThunk('branch/addBranch', async (branchData: Omit<Branch, 'id'>) => {
    const response = await api.post('/branches', branchData);
    return response.data;
});

export const updateBranch = createAsyncThunk('branch/updateBranch', async ({ id, data }: { id: number; data: Omit<Branch, 'id'> }) => {
    const response = await api.put(`/branches/${id}`, data);
    return response.data;
});

export const deleteBranch = createAsyncThunk('branch/deleteBranch', async (id: number) => {
    await api.delete(`/branches/${id}`);
    return id;
});

interface BranchState {
    items: Branch[];
    loading: boolean;
    error: string | null;
}

const initialState: BranchState = {
    items: [],
    loading: false,
    error: null,
};

const branchSlice = createSlice({
    name: 'branch',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchBranches.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBranches.fulfilled, (state, action: PayloadAction<Branch[]>) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchBranches.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch branches';
            })
            // Add
            .addCase(addBranch.fulfilled, (state, action: PayloadAction<Branch>) => {
                state.items.push(action.payload);
            })
            // Update
            .addCase(updateBranch.fulfilled, (state, action: PayloadAction<Branch>) => {
                const index = state.items.findIndex((item) => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            // Delete
            .addCase(deleteBranch.fulfilled, (state, action: PayloadAction<number>) => {
                state.items = state.items.filter((item) => item.id !== action.payload);
            });
    },
});

export default branchSlice.reducer;
