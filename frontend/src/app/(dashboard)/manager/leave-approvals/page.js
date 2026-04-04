"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';
import { Card } from '@/components/ui/card';

export default function ManagerLeaveApprovalsPage() {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/leave/team-requests');
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

    const statusColor = (s) => {
        if (s === 'Approved') return 'bg-green-900/60 text-green-300 border border-green-800';
        if (s === 'Rejected') return 'bg-red-900/60 text-red-300 border border-red-800';
        if (s === 'Pending') return 'bg-yellow-900/60 text-yellow-300 border border-yellow-800';
        return 'bg-slate-700/60 text-slate-300 border border-slate-600';
    };

    return (
        <RoleProtectedRoute requiredRoles={['Manager']}>
            <div className="space-y-6">
                <div className="flex flex-col mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Team Leave Approvals</h1>
                    <p className="text-slate-400">Review and manage leave requests for your team.</p>
                </div>

                <Card className="bg-slate-800 border-slate-700 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-300">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 border-b border-slate-700">
                                <tr>
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Dates</th>
                                    <th className="px-6 py-4">Reason</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500"><div className="flex items-center justify-center gap-2"><div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />Loading...</div></td></tr>
                                ) : leaves.length === 0 ? (
                                    <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500">No leave requests found.</td></tr>
                                ) : (
                                    leaves.map(req => (
                                        <tr key={req._id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-200">{req.employeeId?.name || '—'}</td>
                                            <td className="px-6 py-4 text-slate-400">{req.leaveType}</td>
                                            <td className="px-6 py-4 text-slate-400">{new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-slate-400 max-w-xs truncate" title={req.reason}>{req.reason}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColor(req.status)}`}>{req.status}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {req.status === 'Pending' ? (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleAction(req._id, 'approve')}
                                                            className="px-3 py-1 bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded-md text-xs font-medium transition-colors border border-green-800">
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(req._id, 'reject')}
                                                            className="px-3 py-1 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-md text-xs font-medium transition-colors border border-red-800">
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : <span className="text-slate-500 italic text-xs">Action taken</span>}
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
