'use client';

import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';
import { Card } from '@/components/ui/card';
import { useUsers } from '@/hooks/useUsers';

export default function UsersManagementPage() {
    const { users, loading, error } = useUsers({ limit: 50 });

    return (
        <RoleProtectedRoute requiredRoles={['Admin']}>
            <div className="space-y-6">
                <div className="flex flex-col mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">User Management</h1>
                    <p className="text-slate-400">Manage system users, assign roles, and handle account statuses.</p>
                </div>

                {error && (
                    <div className="rounded-md bg-red-900/40 border border-red-800 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <Card className="bg-slate-800 border-slate-700 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-300">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 border-b border-slate-700">
                                <tr>
                                    <th scope="col" className="px-6 py-4">Name</th>
                                    <th scope="col" className="px-6 py-4">Email</th>
                                    <th scope="col" className="px-6 py-4">Roles</th>
                                    <th scope="col" className="px-6 py-4">Department</th>
                                    <th scope="col" className="px-6 py-4">Status</th>
                                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
                                                Loading users…
                                            </div>
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                                            No users found.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((u) => (
                                        <tr
                                            key={u._id}
                                            className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors"
                                        >
                                            <td className="px-6 py-4 font-medium text-slate-200 whitespace-nowrap">
                                                {u.name}
                                            </td>
                                            <td className="px-6 py-4 text-slate-400">{u.email}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {u.roles.map((r) => (
                                                        <span
                                                            key={r}
                                                            className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-900/60 text-blue-200 border border-blue-800"
                                                        >
                                                            {r}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400">{u.departmentId?.departmentName || '—'}</td>
                                            <td className="px-6 py-4">
                                                {u.isActive ? (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-400">
                                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400">
                                                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </RoleProtectedRoute>
    );
}
