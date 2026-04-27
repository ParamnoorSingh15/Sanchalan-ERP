"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/axios';

export default function EmployeeAttendancePage() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/attendance/my-history');
            setHistory(data.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchHistory(); }, []);

    const handleCheckIn = async () => {
        setActionLoading(true);
        try {
            await api.post('/attendance/check-in');
            fetchHistory();
        } catch (err) { alert(err.response?.data?.error || 'Check-in failed'); }
        finally { setActionLoading(false); }
    };

    const handleCheckOut = async () => {
        setActionLoading(true);
        try {
            await api.post('/attendance/check-out');
            fetchHistory();
        } catch (err) { alert(err.response?.data?.error || 'Check-out failed'); }
        finally { setActionLoading(false); }
    };

    const statusBadge = (s) => {
        if (s === 'Present') return 'badge-success';
        if (s === 'Absent')  return 'badge-danger';
        return 'badge-warning';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>My Attendance</h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Clock in/out and view your attendance history.</p>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={handleCheckIn}
                    disabled={actionLoading}
                    className="px-8 py-4 bg-blue-600 text-white rounded-lg shadow font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    Clock In
                </button>
                <button
                    onClick={handleCheckOut}
                    disabled={actionLoading}
                    className="px-8 py-4 rounded-lg shadow font-medium transition-colors disabled:opacity-50"
                    style={{
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--bg-surface-2)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-2)'; }}
                >
                    Clock Out
                </button>
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
                                <th className="px-6 py-3.5 font-semibold tracking-wide">Date</th>
                                <th className="px-6 py-3.5 font-semibold tracking-wide">Check-In</th>
                                <th className="px-6 py-3.5 font-semibold tracking-wide">Check-Out</th>
                                <th className="px-6 py-3.5 font-semibold tracking-wide">Hours</th>
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
                            ) : history.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                                        No attendance records found.
                                    </td>
                                </tr>
                            ) : (
                                history.map(record => (
                                    <tr
                                        key={record._id}
                                        className="border-b transition-colors duration-150"
                                        style={{ borderColor: 'var(--border)' }}
                                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; }}
                                    >
                                        <td className="px-6 py-3.5 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                            {new Date(record.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                                            {new Date(record.checkIn).toLocaleTimeString()}
                                        </td>
                                        <td className="px-6 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                                            {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '—'}
                                        </td>
                                        <td className="px-6 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                                            {record.workingHours}
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-full tracking-wide ${statusBadge(record.status)}`}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0" />
                                                {record.status}
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
