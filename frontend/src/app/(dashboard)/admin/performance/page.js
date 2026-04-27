"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';

export default function AdminPerformancePage() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await api.get('/performance/all');
                setReviews(data.data || []);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    const ratingColor = (r) => {
        if (r >= 4) return 'badge-success';
        if (r >= 3) return 'badge-warning';
        return 'badge-danger';
    };

    return (
        <RoleProtectedRoute requiredRoles={['Admin']}>
            <div className="space-y-6">
                <div className="flex flex-col mb-8">
                    <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>Performance Reviews</h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Organization-wide performance ratings and reviews.</p>
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
                                    <th className="px-6 py-3.5 font-semibold tracking-wide">Reviewer</th>
                                    <th className="px-6 py-3.5 font-semibold tracking-wide">Period</th>
                                    <th className="px-6 py-3.5 font-semibold tracking-wide">Rating</th>
                                    <th className="px-6 py-3.5 font-semibold tracking-wide">Productivity</th>
                                    <th className="px-6 py-3.5 font-semibold tracking-wide">Tasks Done</th>
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
                                ) : reviews.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                                            No performance reviews found.
                                        </td>
                                    </tr>
                                ) : (
                                    reviews.map(r => (
                                        <tr
                                            key={r._id}
                                            className="border-b transition-colors duration-150"
                                            style={{ borderColor: 'var(--border)' }}
                                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; }}
                                        >
                                            <td className="px-6 py-3.5 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{r.employeeId?.name || '—'}</td>
                                            <td className="px-6 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>{r.reviewerId?.name || '—'}</td>
                                            <td className="px-6 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>{r.reviewPeriod}</td>
                                            <td className="px-6 py-3.5">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-semibold rounded-full ${ratingColor(r.rating)}`}>
                                                    {r.rating}/5
                                                </span>
                                            </td>
                                            <td className="px-6 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>{r.productivityScore || '—'}</td>
                                            <td className="px-6 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>{r.tasksCompleted || '—'}</td>
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
