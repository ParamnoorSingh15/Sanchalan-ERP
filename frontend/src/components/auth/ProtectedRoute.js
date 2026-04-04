'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Wraps any page that requires the user to be authenticated.
 * Shows a loading screen while the auth state is resolving.
 * Redirects to /login if the user is not authenticated.
 */
export default function ProtectedRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !isAuthenticated && pathname !== '/login') {
            router.replace('/login');
        }
    }, [isLoading, isAuthenticated, pathname, router]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-900 text-slate-200">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />
                    <span className="text-sm text-slate-400">Loading Sanchalan ERP…</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return <>{children}</>;
}
