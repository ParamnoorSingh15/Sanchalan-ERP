"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';
import { Card } from '@/components/ui/card';

export default function AdminDepartmentsPage() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ departmentName: '', description: '' });

    const fetchDepts = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/departments');
            setDepartments(data.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchDepts(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/departments/create', form);
            setForm({ departmentName: '', description: '' });
            setShowForm(false);
            fetchDepts();
        } catch (err) { alert(err.response?.data?.error || 'Error'); }
    };

    return (
        <RoleProtectedRoute requiredRoles={['Admin']}>
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Departments</h1>
                        <p className="text-slate-400">Manage organizational departments.</p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        {showForm ? 'Cancel' : '+ New Department'}
                    </button>
                </div>

                {showForm && (
                    <Card className="bg-slate-800 border-slate-700 p-6">
                        <form onSubmit={handleCreate} className="flex flex-col gap-4">
                            <input value={form.departmentName} onChange={e => setForm({ ...form, departmentName: e.target.value })} placeholder="Department Name" required className="bg-slate-900 border border-slate-700 rounded-md px-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" className="bg-slate-900 border border-slate-700 rounded-md px-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors w-fit">Create Department</button>
                        </form>
                    </Card>
                )}

                <Card className="bg-slate-800 border-slate-700 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-300">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 border-b border-slate-700">
                                <tr>
                                    <th className="px-6 py-4">Department</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="3" className="px-6 py-10 text-center text-slate-500"><div className="flex items-center justify-center gap-2"><div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />Loading...</div></td></tr>
                                ) : departments.length === 0 ? (
                                    <tr><td colSpan="3" className="px-6 py-10 text-center text-slate-500">No departments found.</td></tr>
                                ) : (
                                    departments.map(d => (
                                        <tr key={d._id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-200">{d.departmentName}</td>
                                            <td className="px-6 py-4 text-slate-400">{d.description || '—'}</td>
                                            <td className="px-6 py-4 text-slate-400">{new Date(d.createdAt).toLocaleDateString()}</td>
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
