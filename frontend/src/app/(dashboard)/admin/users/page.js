'use client';

import { useState, useCallback, useMemo, memo } from 'react';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';
import { useUsers } from '@/hooks/useUsers';
import EditUserModal from './EditUserModal';

function getStatusBadge(user) {
    const status = user.status || (user.isActive ? 'Active' : 'Inactive');
    const map = {
        Active:     'badge-success',
        'On Leave': 'badge-warning',
        Suspended:  'badge-danger',
        Terminated: 'badge-danger',
        Inactive:   'badge-muted',
    };
    return { cls: map[status] || 'badge-muted', status };
}

const UserRow = memo(function UserRow({ user, onEdit }) {
    const { cls, status } = getStatusBadge(user);
    return (
        <tr
            className="border-b transition-colors duration-150 group"
            style={{ borderColor: 'var(--border)' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; }}
        >
            <td className="px-6 py-3.5 text-sm font-medium whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                {user.name}
            </td>
            <td className="px-6 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                {user.email}
            </td>
            <td className="px-6 py-3.5">
                <div className="flex flex-wrap gap-1.5">
                    {user.roles.map(r => (
                        <span key={r} className="badge-info inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full tracking-wide shadow-sm">
                            {r}
                        </span>
                    ))}
                </div>
            </td>
            <td className="px-6 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                {user.departmentId?.departmentName || '—'}
            </td>
            <td className="px-6 py-3.5">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-full tracking-wide shadow-sm ${cls}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0" />
                    {status}
                </span>
            </td>
            <td className="px-6 py-3.5 text-right">
                <button
                    className="badge-info inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-150"
                    onClick={() => onEdit(user)}
                >
                    Edit
                </button>
            </td>
        </tr>
    );
});

export default function UsersManagementPage() {
    const { users, loading, error, updateUser, refetch } = useUsers({ limit: 50 });
    const [selectedUser, setSelectedUser] = useState(null);

    const handleEditClick  = useCallback(u  => setSelectedUser(u),   []);
    const handleClose      = useCallback(() => setSelectedUser(null), []);
    const handleSaveUser   = useCallback(async (id, data) => {
        const result = await updateUser(id, data);
        if (result.success) refetch();
        return result;
    }, [updateUser, refetch]);

    const sortedUsers = useMemo(
        () => [...(users || [])].sort((a, b) => a.name.localeCompare(b.name)),
        [users]
    );

    return (
        <RoleProtectedRoute requiredRoles={['Admin']}>
            <div className="space-y-6">
                <div className="flex flex-col mb-8">
                    <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
                        User Management
                    </h1>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        Manage system users, assign roles, and handle account statuses.
                    </p>
                </div>

                {error && (
                    <div className="flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm badge-danger">
                        <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                        {error}
                    </div>
                )}

                <div
                    className="rounded-xl shadow-sm overflow-hidden card-hover border transition-colors duration-300"
                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                >
                    <div className="overflow-x-auto" data-lenis-prevent="true">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase sticky top-0 z-10"
                                   style={{
                                       backgroundColor: 'var(--bg-surface-3)',
                                       borderBottom: '1px solid var(--border)',
                                       color: 'var(--text-secondary)',
                                   }}>
                                <tr>
                                    <th className="px-6 py-3.5 font-semibold tracking-wide">Name</th>
                                    <th className="px-6 py-3.5 font-semibold tracking-wide">Email</th>
                                    <th className="px-6 py-3.5 font-semibold tracking-wide">Roles</th>
                                    <th className="px-6 py-3.5 font-semibold tracking-wide">Department</th>
                                    <th className="px-6 py-3.5 font-semibold tracking-wide">Status</th>
                                    <th className="px-6 py-3.5 text-right font-semibold tracking-wide">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 6 }).map((_, i) => (
                                        <tr key={i} className="border-b" style={{ borderColor: 'var(--border)' }}>
                                            {Array.from({ length: 6 }).map((_, j) => (
                                                <td key={j} className="px-6 py-4">
                                                    <div className="h-3.5 rounded animate-pulse"
                                                         style={{ width: `${50 + j * 8}%`, backgroundColor: 'var(--bg-surface-3)' }} />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : sortedUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                                            No users found.
                                        </td>
                                    </tr>
                                ) : (
                                    sortedUsers.map(u => <UserRow key={u._id} user={u} onEdit={handleEditClick} />)
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <EditUserModal
                user={selectedUser}
                isOpen={!!selectedUser}
                onClose={handleClose}
                onSave={handleSaveUser}
            />
        </RoleProtectedRoute>
    );
}
