import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
    withCredentials: true,
});

/**
 * These endpoints should never trigger the silent token-refresh logic.
 * - /auth/login  – user is actively logging in, no token exists yet
 * - /auth/refresh – the refresh call itself; avoid recursive retries
 * - /users/me    – the initial auth-bootstrap call; if this 401s it simply
 *                  means the user is not logged in — let the caller handle it
 */
const SKIP_REFRESH_FOR = ['/auth/login', '/auth/refresh', '/users/me'];

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const isUnauthorized = error.response?.status === 401;
        const alreadyRetried = originalRequest._retry === true;
        const skipRefresh = SKIP_REFRESH_FOR.some((url) =>
            originalRequest.url?.includes(url)
        );

        if (isUnauthorized && !alreadyRetried && !skipRefresh) {
            originalRequest._retry = true;
            try {
                const { data } = await axios.post(
                    `${api.defaults.baseURL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );
                const { accessToken } = data;

                api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                // Notify AuthContext so it can update state
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(
                        new CustomEvent('tokenRefreshed', { detail: { accessToken } })
                    );
                }

                return api(originalRequest);
            } catch {
                // Refresh failed – the user's session is truly expired.
                // Only force logout if the user was actually logged in
                // (i.e. we had an Authorization header set).
                const wasLoggedIn = !!api.defaults.headers.common['Authorization'];
                if (wasLoggedIn && typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('authLogout'));
                }
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
