"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Card } from '@/components/ui/card';

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

    return (
        <div className="space-y-6">
            <div className="flex flex-col mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">My Attendance</h1>
                <p className="text-slate-400">Clock in/out and view your attendance history.</p>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={handleCheckIn}
                    disabled={actionLoading}
                    className="px-8 py-4 bg-blue-600 text-white rounded-lg shadow font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
                    Clock In
                </button>
                <button
                    onClick={handleCheckOut}
                    disabled={actionLoading}
                    className="px-8 py-4 border border-slate-600 text-slate-200 rounded-lg shadow font-medium hover:bg-slate-800 transition-colors disabled:opacity-50">
                    Clock Out
                </button>
            </div>

            <Card className="bg-slate-800 border-slate-700 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Check-In</th>
                                <th className="px-6 py-4">Check-Out</th>
                                <th className="px-6 py-4">Hours</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-500"><div className="flex items-center justify-center gap-2"><div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />Loading...</div></td></tr>
                            ) : history.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-500">No attendance records found.</td></tr>
                            ) : (
                                history.map(record => (
                                    <tr key={record._id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 text-slate-200">{new Date(record.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-slate-400">{new Date(record.checkIn).toLocaleTimeString()}</td>
                                        <td className="px-6 py-4 text-slate-400">{record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '—'}</td>
                                        <td className="px-6 py-4 text-slate-400">{record.workingHours}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${record.status === 'Present' ? 'bg-green-900/60 text-green-300 border border-green-800' : 'bg-yellow-900/60 text-yellow-300 border border-yellow-800'}`}>{record.status}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
