import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle authentication/authorization errors
        if (error.response?.status === 401 || error.response?.status === 403) {
            const errorMessage = error.response?.data?.message || '';

            console.log('[Axios Interceptor] Auth error detected:', {
                status: error.response?.status,
                message: errorMessage,
                url: originalRequest?.url
            });

            // Check if it's an account inactive, session invalidated, or auth error
            const shouldLogout =
                error.response?.status === 401 ||
                errorMessage.toLowerCase().includes('inactive') ||
                errorMessage.toLowerCase().includes('session') ||
                errorMessage.toLowerCase().includes('token');

            if (shouldLogout && !originalRequest._retry) {
                originalRequest._retry = true;

                console.log('[Axios Interceptor] Silently logging out and redirecting...');

                // Clear all session data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                sessionStorage.clear();

                // Silent redirect - no alert
                setTimeout(() => {
                    console.log('[Axios Interceptor] Redirecting to login...');
                    window.location.replace('/login');
                }, 100);

                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
