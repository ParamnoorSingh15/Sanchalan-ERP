"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';
import { Card } from '@/components/ui/card';

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

    return (
        <RoleProtectedRoute requiredRoles={['Admin']}>
            <div className="space-y-6">
                <div className="flex flex-col mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Performance Reviews</h1>
                    <p className="text-slate-400">Organization-wide performance ratings and reviews.</p>
                </div>
                <Card className="bg-slate-800 border-slate-700 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-300">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 border-b border-slate-700">
                                <tr>
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-6 py-4">Reviewer</th>
                                    <th className="px-6 py-4">Period</th>
                                    <th className="px-6 py-4">Rating</th>
                                    <th className="px-6 py-4">Productivity</th>
                                    <th className="px-6 py-4">Tasks Done</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500"><div className="flex items-center justify-center gap-2"><div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />Loading...</div></td></tr>
                                ) : reviews.length === 0 ? (
                                    <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500">No performance reviews found.</td></tr>
                                ) : (
                                    reviews.map(r => (
                                        <tr key={r._id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-200">{r.employeeId?.name || '—'}</td>
                                            <td className="px-6 py-4 text-slate-400">{r.reviewerId?.name || '—'}</td>
                                            <td className="px-6 py-4 text-slate-400">{r.reviewPeriod}</td>
                                            <td className="px-6 py-4"><span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-900/60 text-amber-300 border border-amber-800">{r.rating}/5</span></td>
                                            <td className="px-6 py-4 text-slate-400">{r.productivityScore || '—'}</td>
                                            <td className="px-6 py-4 text-slate-400">{r.tasksCompleted || '—'}</td>
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
