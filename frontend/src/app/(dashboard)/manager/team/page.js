"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';
import { Card } from '@/components/ui/card';

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
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">My Team</h1>
                    <p className="text-slate-400">Employees in your department.</p>
                </div>
                <Card className="bg-slate-800 border-slate-700 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-300">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 border-b border-slate-700">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Designation</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-500"><div className="flex items-center justify-center gap-2"><div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />Loading...</div></td></tr>
                                ) : employees.length === 0 ? (
                                    <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-500">No team members found.</td></tr>
                                ) : (
                                    employees.map(e => (
                                        <tr key={e._id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-200">{e.name}</td>
                                            <td className="px-6 py-4 text-slate-400">{e.email}</td>
                                            <td className="px-6 py-4 text-slate-400">{e.designation || '—'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${e.isActive ? 'text-green-400' : 'text-red-400'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${e.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                                    {e.status || (e.isActive ? 'Active' : 'Inactive')}
                                                </span>
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
