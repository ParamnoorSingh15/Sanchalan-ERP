"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';
import { Card } from '@/components/ui/card';

export default function AdminManagersPage() {
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [form, setForm] = useState({ name: '', email: '', password: '', departmentId: '' });

    const fetchManagers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/users?limit=1000');
            // Filter to only users who have the "Manager" role
            setManagers(data.data?.filter(u => u.roles.includes('Manager')) || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchDepartments = async () => {
        try {
            const { data } = await api.get('/departments');
            setDepartments(data.data || []);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchManagers();
        fetchDepartments();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users/create-manager', form);
            setForm({ name: '', email: '', password: '', departmentId: '' });
            setShowForm(false);
            fetchManagers();
        } catch (err) { alert(err.response?.data?.error || 'Error creating manager'); }
    };

    return (
        <RoleProtectedRoute requiredRoles={['Admin']}>
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>Manager Accounts</h1>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Create and manage department managers.</p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        {showForm ? 'Cancel' : '+ New Manager'}
                    </button>
                </div>

                {showForm && (
                    <div className="rounded-xl border p-6 shadow-sm mb-6" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full Name" required className="rounded-md px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ backgroundColor: 'var(--bg-surface-3)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" type="email" required className="rounded-md px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ backgroundColor: 'var(--bg-surface-3)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                            <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Password" type="password" required className="rounded-md px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ backgroundColor: 'var(--bg-surface-3)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                            <select value={form.departmentId} onChange={e => setForm({ ...form, departmentId: e.target.value })} className="rounded-md px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ backgroundColor: 'var(--bg-surface-3)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} required>
                                <option value="">Select Department to Manage</option>
                                {departments.map(d => <option key={d._id} value={d._id}>{d.departmentName}</option>)}
                            </select>
                            <div className="md:col-span-2">
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Create Manager</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="rounded-xl shadow-sm overflow-hidden border transition-colors duration-300" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase sticky top-0 z-10" style={{ backgroundColor: 'var(--bg-surface-3)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Department ID</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-500"><div className="flex items-center justify-center gap-2"><div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />Loading...</div></td></tr>
                                ) : managers.length === 0 ? (
                                    <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-500">No managers found.</td></tr>
                                ) : (
                                    managers.map(mgr => (
                                        <tr key={mgr._id} className="border-b transition-colors duration-150" style={{ borderColor: 'var(--border)' }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; }}>
                                            <td className="px-6 py-4 font-medium" style={{ color: 'var(--text-primary)' }}>{mgr.name}</td>
                                            <td className="px-6 py-4" style={{ color: 'var(--text-muted)' }}>{mgr.email}</td>
                                            <td className="px-6 py-4" style={{ color: 'var(--text-muted)' }}>{mgr.departmentId?.departmentName || mgr.departmentId || '—'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${mgr.isActive ? 'text-green-500' : 'text-red-500'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${mgr.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                                    {mgr.status || (mgr.isActive ? 'Active' : 'Inactive')}
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
        </RoleProtectedRoute>
    );
}
