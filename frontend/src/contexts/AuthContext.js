'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        try {
            const { data } = await api.get('/users/me');
            setUser(data);
            setIsAuthenticated(true);
        } catch {
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout');
        } catch {
            // Swallow errors — still clear local state
        } finally {
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
            setIsAuthenticated(false);
            // Guard: only redirect if not already on the login page
            if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                window.location.replace('/login');
            }
        }
    }, []);

    useEffect(() => {
        fetchUser();

        // Listen for events dispatched by the axios interceptor
        const handleLogout = () => logout();
        const handleTokenRefreshed = (e) => {
            const { accessToken } = e.detail;
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            // Optionally re-fetch user to keep state fresh
            fetchUser();
        };

        window.addEventListener('authLogout', handleLogout);
        window.addEventListener('tokenRefreshed', handleTokenRefreshed);

        return () => {
            window.removeEventListener('authLogout', handleLogout);
            window.removeEventListener('tokenRefreshed', handleTokenRefreshed);
        };
    }, [fetchUser, logout]);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        await fetchUser();
    };

    const hasRole = useCallback(
        (roleArray) => {
            if (!user?.roles) return false;
            return user.roles.some((r) => roleArray.includes(r));
        },
        [user]
    );

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside an AuthProvider');
    return ctx;
};
