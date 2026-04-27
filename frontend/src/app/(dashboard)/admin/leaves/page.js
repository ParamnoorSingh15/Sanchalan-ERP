"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';

export default function AdminLeavesPage() {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/leave/all');
            setLeaves(data.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchLeaves(); }, []);

    const handleAction = async (id, actionType) => {
        try {
            await api.put(`/leave/${id}/${actionType}`);
            fetchLeaves();
        } catch (err) { alert(err.response?.data?.error || `Error ${actionType} leave`); }
    };

    const statusBadge = (s) => {
        if (s === 'Approved') return 'badge-success';
        if (s === 'Rejected') return 'badge-danger';
        if (s === 'Pending')  return 'badge-warning';
        return 'badge-muted';
    };

    return (
        <RoleProtectedRoute requiredRoles={['Admin']}>
            <div className="space-y-6">
                <div className="flex flex-col mb-8">
                    <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>Leave Approvals</h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Review and manage organizational leave requests.</p>
                </div>

                <div
                    className="rounded-xl shadow-sm overflow-hidden border transition-colors duration-300"
                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                >
                    <div className="overflow-x-auto" data-lenis-prevent="true">
                        <table className="w-full text-sm text-left">
                            <thead
                                className="text-xs uppercase sticky top-0 z-10"
                                style={{
                                    backgroundColor: 'var(--bg-surface-3)',
                                    borderBottom: '1px solid var(--border)',
                                    color: 'var(--text-secondary)',
                                }}
                            >
                                <tr>
                                    <th className="px-6 py-3.5 font-semibold tracking-wide">Employee</th>
                                    <th className="px-6 py-3.5 font-semibold tracking-wide">Type</th>
                                    <th className="px-6 py-3.5 font-semibold tracking-wide">Dates</th>
                                    <th className="px-6 py-3.5 font-semibold tracking-wide">Reason</th>
                                    <th className="px-6 py-3.5 font-semibold tracking-wide">Status</th>
                                    <th className="px-6 py-3.5 font-semibold tracking-wide">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="border-b" style={{ borderColor: 'var(--border)' }}>
                                            {Array.from({ length: 6 }).map((_, j) => (
                                                <td key={j} className="px-6 py-4">
                                                    <div className="h-3.5 rounded animate-pulse" style={{ width: `${50 + j * 7}%`, backgroundColor: 'var(--bg-surface-3)' }} />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : leaves.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                                            No leave requests found.
                                        </td>
                                    </tr>
                                ) : (
                                    leaves.map(req => (
                                        <tr
                                            key={req._id}
                                            className="border-b transition-colors duration-150"
                                            style={{ borderColor: 'var(--border)' }}
                                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; }}
                                        >
                                            <td className="px-6 py-3.5 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{req.employeeId?.name || '—'}</td>
                                            <td className="px-6 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>{req.leaveType}</td>
                                            <td className="px-6 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                                                {new Date(req.startDate).toLocaleDateString()} – {new Date(req.endDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-3.5 text-sm max-w-xs truncate" style={{ color: 'var(--text-muted)' }} title={req.reason}>{req.reason}</td>
                                            <td className="px-6 py-3.5">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-full tracking-wide ${statusBadge(req.status)}`}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0" />
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3.5">
                                                {req.status === 'Pending' ? (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleAction(req._id, 'approve')}
                                                            className="px-3 py-1 rounded-md text-xs font-medium transition-colors badge-success"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(req._id, 'reject')}
                                                            className="px-3 py-1 rounded-md text-xs font-medium transition-colors badge-danger"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs italic" style={{ color: 'var(--text-muted)' }}>Action taken</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </RoleProtectedRoute>
    );
}
