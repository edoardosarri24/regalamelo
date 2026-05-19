import axios from 'axios';

// Singleton instance
const api = axios.create({
    baseURL: '/api/v1',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const setAuthToken = (token: string | null) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Token Refresher Logic - Exclude verification endpoint to avoid red-herrings
        if (
            error.response?.status === 401 && 
            !originalRequest._retry && 
            !originalRequest.url?.includes('/auth/verify-email')
        ) {
            originalRequest._retry = true;
            try {
                const { data } = await axios.post(
                    '/api/v1/auth/refresh',
                    {},
                    { withCredentials: true }
                );
                const { token } = data;
                setAuthToken(token);

                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails, user needs to re-authenticate manually
                setAuthToken(null);
                // Dispatch global event or call a context method to clear session out of react router
                window.dispatchEvent(new CustomEvent('auth-error'));
                return Promise.reject(refreshError);
            }
        }

        // Handled global rejection
        return Promise.reject(error);
    }
);

export default api;
