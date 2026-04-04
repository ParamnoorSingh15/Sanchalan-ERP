"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

    const statusColor = (s) => {
        if (s === 'Approved') return 'bg-green-900/60 text-green-300 border-green-800';
        if (s === 'Rejected') return 'bg-red-900/60 text-red-300 border-red-800';
        if (s === 'Pending') return 'bg-yellow-900/60 text-yellow-300 border-yellow-800';
        return 'bg-slate-700/60 text-slate-300 border-slate-600';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">My Leaves</h1>
                    <p className="text-slate-400">Request and track your leave history.</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    {showForm ? 'Cancel' : '+ Request Leave'}
                </button>
            </div>

            {showForm && (
                <Card className="bg-slate-800 border-slate-700 p-6">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <select value={form.leaveType} onChange={e => setForm({ ...form, leaveType: e.target.value })} className="bg-slate-900 border border-slate-700 rounded-md px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="Casual">Casual</option>
                            <option value="Sick">Sick</option>
                            <option value="Annual">Annual</option>
                            <option value="Unpaid">Unpaid</option>
                        </select>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required className="bg-slate-900 border border-slate-700 rounded-md px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required className="bg-slate-900 border border-slate-700 rounded-md px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Reason" required className="bg-slate-900 border border-slate-700 rounded-md px-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors w-fit">Submit Request</button>
                    </form>
                </Card>
            )}

            <Card className="bg-slate-800 border-slate-700 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">From</th>
                                <th className="px-6 py-4">To</th>
                                <th className="px-6 py-4">Reason</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-500"><div className="flex items-center justify-center gap-2"><div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />Loading...</div></td></tr>
                            ) : leaves.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-500">No leave requests found.</td></tr>
                            ) : (
                                leaves.map(l => (
                                    <tr key={l._id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-200">{l.leaveType}</td>
                                        <td className="px-6 py-4 text-slate-400">{new Date(l.startDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-slate-400">{new Date(l.endDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-slate-400">{l.reason}</td>
                                        <td className="px-6 py-4"><span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${statusColor(l.status)}`}>{l.status}</span></td>
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
