import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/axios';

export interface AppSettings {
    businessName: string;
    businessEmail: string;
    defaultCC: string;
    replyTo: string;
    maintenanceMode: boolean;
    fileNumberPrefix?: string;
    fileNumberSequence?: number;
    padding?: number;
}

interface AppSettingsState {
    settings: AppSettings | null;
    isLoading: boolean;
    error: string | null;
    successMessage: string | null;
}

const initialState: AppSettingsState = {
    settings: null,
    isLoading: false,
    error: null,
    successMessage: null,
};

export const fetchSettings = createAsyncThunk(
    'appSettings/fetchSettings',
    async () => {
        const response = await api.get('/app-settings');
        return response.data;
    }
);

export const updateSettings = createAsyncThunk(
    'appSettings/updateSettings',
    async (settings: AppSettings) => {
        const response = await api.put('/app-settings', settings);
        return response.data;
    }
);

const appSettingsSlice = createSlice({
    name: 'appSettings',
    initialState,
    reducers: {
        clearMessages: (state) => {
            state.error = null;
            state.successMessage = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Settings
            .addCase(fetchSettings.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchSettings.fulfilled, (state, action: PayloadAction<AppSettings>) => {
                state.isLoading = false;
                state.settings = action.payload;
            })
            .addCase(fetchSettings.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch settings';
            })
            // Update Settings
            .addCase(updateSettings.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(updateSettings.fulfilled, (state, action: PayloadAction<AppSettings>) => {
                state.isLoading = false;
                state.settings = action.payload;
                state.successMessage = 'Settings updated successfully';
            })
            .addCase(updateSettings.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to update settings';
            });
    },
});

export const { clearMessages } = appSettingsSlice.actions;
export default appSettingsSlice.reducer;
