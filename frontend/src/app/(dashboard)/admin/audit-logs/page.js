'use client';

import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';
import { Card } from '@/components/ui/card';
import { useAuditLogs } from '@/hooks/useAuditLogs';

const ACTION_STYLES = {
    SUCCESS: 'bg-green-900/60 text-green-300 border border-green-800',
    FAILURE: 'bg-red-900/60 text-red-300 border border-red-800',
    DEFAULT: 'bg-slate-700/60 text-slate-300 border border-slate-600',
};

function getActionStyle(action) {
    if (action.includes('SUCCESS')) return ACTION_STYLES.SUCCESS;
    if (action.includes('FAILURE')) return ACTION_STYLES.FAILURE;
    return ACTION_STYLES.DEFAULT;
}

export default function AuditLogsPage() {
    const { logs, loading, error } = useAuditLogs({ limit: 50 });

    return (
        <RoleProtectedRoute requiredRoles={['Admin']}>
            <div className="space-y-6">
                <div className="flex flex-col mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">System Audit Logs</h1>
                    <p className="text-slate-400">Immutable records of all authentication and authorization events.</p>
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
                                    <th scope="col" className="px-6 py-4">Timestamp</th>
                                    <th scope="col" className="px-6 py-4">User</th>
                                    <th scope="col" className="px-6 py-4">Action</th>
                                    <th scope="col" className="px-6 py-4">IP Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center text-slate-500">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
                                                Loading audit logs…
                                            </div>
                                        </td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center text-slate-500">
                                            No audit logs found.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr
                                            key={log._id}
                                            className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-400 tabular-nums">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-200">
                                                {log.userId?.email || (
                                                    <span className="text-slate-500 italic">System</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getActionStyle(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                                                {log.details?.ip || '—'}
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
