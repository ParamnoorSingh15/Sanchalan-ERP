"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';
import { Card } from '@/components/ui/card';

export default function AdminAttendancePage() {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await api.get('/attendance/all');
                setAttendance(data.data || []);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    return (
        <RoleProtectedRoute requiredRoles={['Admin']}>
            <div className="space-y-6">
                <div className="flex flex-col mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">System Attendance</h1>
                    <p className="text-slate-400">View attendance records across all departments.</p>
                </div>
                <Card className="bg-slate-800 border-slate-700 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-300">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 border-b border-slate-700">
                                <tr>
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Check-In</th>
                                    <th className="px-6 py-4">Check-Out</th>
                                    <th className="px-6 py-4">Hours</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500"><div className="flex items-center justify-center gap-2"><div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />Loading...</div></td></tr>
                                ) : attendance.length === 0 ? (
                                    <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500">No attendance records found.</td></tr>
                                ) : (
                                    attendance.map(a => (
                                        <tr key={a._id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-200">{a.employeeId?.name || '—'}</td>
                                            <td className="px-6 py-4 text-slate-400">{new Date(a.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-slate-400">{new Date(a.checkIn).toLocaleTimeString()}</td>
                                            <td className="px-6 py-4 text-slate-400">{a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : '—'}</td>
                                            <td className="px-6 py-4 text-slate-400">{a.workingHours || 0}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${a.status === 'Present' ? 'bg-green-900/60 text-green-300 border border-green-800' : 'bg-yellow-900/60 text-yellow-300 border border-yellow-800'}`}>{a.status}</span>
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
