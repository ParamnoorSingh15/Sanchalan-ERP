"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/axios';

export default function EmployeeLeavesPage() {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ leaveType: 'Casual', startDate: '', endDate: '', reason: '' });

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/leave/my-requests');
            setLeaves(data.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchLeaves(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/leave/request', form);
            setForm({ leaveType: 'Casual', startDate: '', endDate: '', reason: '' });
            setShowForm(false);
            fetchLeaves();
        } catch (err) { alert(err.response?.data?.error || 'Error'); }
    };

    const statusBadge = (s) => {
        if (s === 'Approved') return 'badge-success';
        if (s === 'Rejected') return 'badge-danger';
        if (s === 'Pending')  return 'badge-warning';
        return 'badge-muted';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>My Leaves</h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Request and track your leave history.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    {showForm ? 'Cancel' : '+ Request Leave'}
                </button>
            </div>

            {showForm && (
                <div className="rounded-xl border p-6 shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <select
                            value={form.leaveType}
                            onChange={e => setForm({ ...form, leaveType: e.target.value })}
                            className="rounded-md px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ backgroundColor: 'var(--bg-surface-3)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                        >
                            <option value="Casual">Casual</option>
                            <option value="Sick">Sick</option>
                            <option value="Annual">Annual</option>
                            <option value="Unpaid">Unpaid</option>
                        </select>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="date"
                                value={form.startDate}
                                onChange={e => setForm({ ...form, startDate: e.target.value })}
                                required
                                className="rounded-md px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:light_dark]"
                                style={{ backgroundColor: 'var(--bg-surface-3)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                            />
                            <input
                                type="date"
                                value={form.endDate}
                                onChange={e => setForm({ ...form, endDate: e.target.value })}
                                required
                                className="rounded-md px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:light_dark]"
                                style={{ backgroundColor: 'var(--bg-surface-3)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                            />
                        </div>
                        <input
                            value={form.reason}
                            onChange={e => setForm({ ...form, reason: e.target.value })}
                            placeholder="Reason"
                            required
                            className="rounded-md px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ backgroundColor: 'var(--bg-surface-3)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                        />
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors w-fit">
                            Submit Request
                        </button>
                    </form>
                </div>
            )}

            <div
                className="rounded-xl shadow-sm overflow-hidden border transition-colors duration-300"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
            >
                <div className="overflow-x-auto" data-lenis-prevent="true">
                    <table className="w-full text-sm text-left">
                        <thead
                            className="text-xs uppercase sticky top-0 z-10"
                            style={{ backgroundColor: 'var(--bg-surface-3)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                        >
                            <tr>
                                <th className="px-6 py-3.5 font-semibold tracking-wide">Type</th>
                                <th className="px-6 py-3.5 font-semibold tracking-wide">From</th>
                                <th className="px-6 py-3.5 font-semibold tracking-wide">To</th>
                                <th className="px-6 py-3.5 font-semibold tracking-wide">Reason</th>
                                <th className="px-6 py-3.5 font-semibold tracking-wide">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="border-b" style={{ borderColor: 'var(--border)' }}>
                                        {Array.from({ length: 5 }).map((_, j) => (
                                            <td key={j} className="px-6 py-4">
                                                <div className="h-3.5 rounded animate-pulse" style={{ width: `${50 + j * 8}%`, backgroundColor: 'var(--bg-surface-3)' }} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : leaves.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                                        No leave requests found.
                                    </td>
                                </tr>
                            ) : (
                                leaves.map(l => (
                                    <tr
                                        key={l._id}
                                        className="border-b transition-colors duration-150"
                                        style={{ borderColor: 'var(--border)' }}
                                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; }}
                                    >
                                        <td className="px-6 py-3.5 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{l.leaveType}</td>
                                        <td className="px-6 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>{new Date(l.startDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>{new Date(l.endDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>{l.reason}</td>
                                        <td className="px-6 py-3.5">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-full tracking-wide shadow-sm ${statusBadge(l.status)}`}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0" />
                                                {l.status}
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
    );
}
