import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api/onedrive';

export const useOneDrive = (accessToken: string | null) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getAuthHeaders = useCallback(() => ({
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    }), [accessToken]);

    const createCompanyDocument = useCallback(async (companyName: string, docType: string) => {
        if (!accessToken) throw new Error("No access token available");
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/create-company-document`,
                { companyName, docType },
                getAuthHeaders()
            );
            return response.data;
        } catch (err: any) {
            const msg = err.response?.data?.error || err.message;
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    }, [accessToken, getAuthHeaders]);

    const listFiles = useCallback(async (folderId = 'root') => {
        if (!accessToken) throw new Error("No access token available");
        setLoading(true);
        setError(null);
        try {
            // Backend routes expect folderId query param
            const response = await axios.get(
                `${API_BASE_URL}/files?folderId=${folderId}`,
                getAuthHeaders()
            );
            return response.data;
        } catch (err: any) {
            const msg = err.response?.data?.error || err.message;
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [accessToken, getAuthHeaders]);

    const uploadFile = useCallback(async (file: File, folderId = 'root') => {
        if (!accessToken) throw new Error("No access token available");
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folderId', folderId);

            const response = await axios.post(
                `${API_BASE_URL}/files/upload`,
                formData,
                {
                    ...getAuthHeaders(),
                    headers: {
                        ...getAuthHeaders().headers,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return response.data;
        } catch (err: any) {
            const msg = err.response?.data?.error || err.message;
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [accessToken, getAuthHeaders]);

    const downloadFile = useCallback(async (fileId: string, fileName: string) => {
        if (!accessToken) throw new Error("No access token available");
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(
                `${API_BASE_URL}/files/${fileId}/download`,
                {
                    ...getAuthHeaders(),
                    responseType: 'blob' // Important for binary data
                }
            );

            // Trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return true;
        } catch (err: any) {
            const msg = err.response?.data?.error || err.message;
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [accessToken, getAuthHeaders]);

    const deleteFile = useCallback(async (fileId: string) => {
        if (!accessToken) throw new Error("No access token available");
        setLoading(true);
        setError(null);
        try {
            const response = await axios.delete(
                `${API_BASE_URL}/files/${fileId}`,
                getAuthHeaders()
            );
            return response.data;
        } catch (err: any) {
            const msg = err.response?.data?.error || err.message;
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [accessToken, getAuthHeaders]);

    const createFolder = useCallback(async (folderName: string, parentFolderId = 'root') => {
        if (!accessToken) throw new Error("No access token available");
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/folders`,
                { folderName, parentFolderId },
                getAuthHeaders()
            );
            return response.data;
        } catch (err: any) {
            const msg = err.response?.data?.error || err.message;
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [accessToken, getAuthHeaders]);

    const searchFiles = useCallback(async (query: string) => {
        if (!accessToken) throw new Error("No access token available");
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(
                `${API_BASE_URL}/search?query=${encodeURIComponent(query)}`,
                getAuthHeaders()
            );
            return response.data;
        } catch (err: any) {
            const msg = err.response?.data?.error || err.message;
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [accessToken, getAuthHeaders]);

    return {
        loading,
        error,
        createCompanyDocument,
        listFiles,
        uploadFile,
        downloadFile,
        deleteFile,
        createFolder,
        searchFiles
    };
};
