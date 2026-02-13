import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import roleReducer from './slices/roleSlice';
import applicationReducer from './slices/applicationSlice';
import companyReducer from './slices/companySlice';
import branchReducer from './slices/branchSlice';
import applicationDocumentReducer from './slices/applicationDocumentSlice';
import companyDocumentReducer from './slices/companyDocumentSlice';
import appSettingsReducer from './slices/appSettingsSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        role: roleReducer,
        application: applicationReducer,
        company: companyReducer,
        branch: branchReducer,
        applicationDocument: applicationDocumentReducer,
        companyDocument: companyDocumentReducer,
        appSettings: appSettingsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
