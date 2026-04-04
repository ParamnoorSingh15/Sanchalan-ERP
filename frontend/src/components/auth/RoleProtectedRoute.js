'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Wraps a page that requires specific role(s).
 * Must be used *inside* a ProtectedRoute so the user is already authenticated.
 * Redirects to /unauthorized if the user does not hold a required role.
 *
 * @param {{ children: React.ReactNode, requiredRoles: string[] }} props
 */
export default function RoleProtectedRoute({ children, requiredRoles = [] }) {
    const { hasRole, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !hasRole(requiredRoles)) {
            router.replace('/unauthorized');
        }
    }, [isLoading, hasRole, requiredRoles, router]);

    if (isLoading) return null;
    if (!hasRole(requiredRoles)) return null;

    return <>{children}</>;
}
