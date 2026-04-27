"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';

export default function ManagerTeamPage() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await api.get('/employees');
                setEmployees(data.data || []);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    return (
        <RoleProtectedRoute requiredRoles={['Manager']}>
            <div className="space-y-6">
                <div className="flex flex-col mb-8">
                    <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>My Team</h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Employees in your department.</p>
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
                                    <th className="px-6 py-3.5 font-semibold tracking-wide">Name</th>
                                    <th className="px-6 py-3.5 font-semibold tracking-wide">Email</th>
                                    <th className="px-6 py-3.5 font-semibold tracking-wide">Designation</th>
                                    <th className="px-6 py-3.5 font-semibold tracking-wide">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="border-b" style={{ borderColor: 'var(--border)' }}>
                                            {Array.from({ length: 4 }).map((_, j) => (
                                                <td key={j} className="px-6 py-4">
                                                    <div className="h-3.5 rounded animate-pulse" style={{ width: `${50 + j * 10}%`, backgroundColor: 'var(--bg-surface-3)' }} />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : employees.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                                            No team members found.
                                        </td>
                                    </tr>
                                ) : (
                                    employees.map(e => (
                                        <tr
                                            key={e._id}
                                            className="border-b transition-colors duration-150"
                                            style={{ borderColor: 'var(--border)' }}
                                            onMouseEnter={ev => { ev.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                                            onMouseLeave={ev => { ev.currentTarget.style.backgroundColor = ''; }}
                                        >
                                            <td className="px-6 py-3.5 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{e.name}</td>
                                            <td className="px-6 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>{e.email}</td>
                                            <td className="px-6 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>{e.designation || '—'}</td>
                                            <td className="px-6 py-3.5">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-full tracking-wide shadow-sm ${e.isActive ? 'badge-success' : 'badge-muted'}`}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0" />
                                                    {e.status || (e.isActive ? 'Active' : 'Inactive')}
                                                </span>
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
