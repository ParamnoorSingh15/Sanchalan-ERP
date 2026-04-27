'use client';

import { useMemo, memo } from 'react';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';
import { useAuditLogs } from '@/hooks/useAuditLogs';

function getActionBadgeClass(action) {
    if (action.includes('SUCCESS'))  return 'badge-success';
    if (action.includes('FAILURE'))  return 'badge-danger';
    if (action.includes('RESET') || action.includes('REQUEST')) return 'badge-warning';
    return 'badge-muted';
}

const LogRow = memo(function LogRow({ log }) {
    return (
        <tr
            className="border-b transition-colors duration-150"
            style={{ borderColor: 'var(--border)' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; }}
        >
            <td className="px-6 py-3.5 whitespace-nowrap font-mono text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
                {new Date(log.timestamp).toLocaleString()}
            </td>
            <td className="px-6 py-3.5 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {log.userId?.email || (
                    <span className="italic font-normal" style={{ color: 'var(--text-muted)' }}>System</span>
                )}
            </td>
            <td className="px-6 py-3.5">
                <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-semibold rounded-full tracking-wide shadow-sm transition-all duration-200 ${getActionBadgeClass(log.action)}`}>
                    {log.action}
                </span>
            </td>
            <td className="px-6 py-3.5 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                {log.details?.ip || '—'}
            </td>
        </tr>
    );
});

export default function AuditLogsPage() {
    const { logs, loading, error } = useAuditLogs({ limit: 50 });

    const sortedLogs = useMemo(
        () => [...(logs || [])].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
        [logs]
    );

    return (
        <RoleProtectedRoute requiredRoles={['Admin']}>
            <div className="space-y-6">
                <div className="flex flex-col mb-8">
                    <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
                        System Audit Logs
                    </h1>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        Immutable records of all authentication and authorization events.
                    </p>
                </div>

                {error && (
                    <div className="flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm badge-danger">
                        <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                        {error}
                    </div>
                )}

                {/* Card */}
                <div
                    className="rounded-xl shadow-sm overflow-hidden card-hover border transition-colors duration-300"
                    style={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: 'var(--border)',
                    }}
                >
                    <div className="overflow-auto h-[min(800px,calc(100vh-16rem))]" data-lenis-prevent="true">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase sticky top-0 z-10"
                                   style={{
                                       backgroundColor: 'var(--bg-surface-3)',
                                       borderBottom: '1px solid var(--border)',
                                       color: 'var(--text-secondary)',
                                   }}>
                                <tr>
                                    <th className="px-6 py-3.5 font-semibold tracking-wide">Timestamp</th>
                                    <th className="px-6 py-3.5 font-semibold tracking-wide">User</th>
                                    <th className="px-6 py-3.5 font-semibold tracking-wide">Action</th>
                                    <th className="px-6 py-3.5 font-semibold tracking-wide">IP Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 8 }).map((_, i) => (
                                        <tr key={i} className="border-b" style={{ borderColor: 'var(--border)' }}>
                                            {Array.from({ length: 4 }).map((_, j) => (
                                                <td key={j} className="px-6 py-4">
                                                    <div className="h-3.5 rounded animate-pulse"
                                                         style={{ width: `${60 + j * 10}%`, backgroundColor: 'var(--bg-surface-3)' }} />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : sortedLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                                            No audit logs found.
                                        </td>
                                    </tr>
                                ) : (
                                    sortedLogs.map(log => <LogRow key={log._id} log={log} />)
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </RoleProtectedRoute>
    );
}
