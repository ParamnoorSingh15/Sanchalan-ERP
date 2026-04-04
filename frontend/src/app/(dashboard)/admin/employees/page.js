"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';
import { Card } from '@/components/ui/card';

export default function AdminEmployeesPage() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [form, setForm] = useState({ name: '', email: '', password: '', designation: '', departmentId: '', employeeId: '' });

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/employees');
            setEmployees(data.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchDepartments = async () => {
        try {
            const { data } = await api.get('/departments');
            setDepartments(data.data || []);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchEmployees(); fetchDepartments(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users/create-employee', form);
            setForm({ name: '', email: '', password: '', designation: '', departmentId: '', employeeId: '' });
            setShowForm(false);
            fetchEmployees();
        } catch (err) { alert(err.response?.data?.error || 'Error creating employee'); }
    };

    return (
        <RoleProtectedRoute requiredRoles={['Admin']}>
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Employee Management</h1>
                        <p className="text-slate-400">Create and manage employee accounts.</p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        {showForm ? 'Cancel' : '+ New Employee'}
                    </button>
                </div>

                {showForm && (
                    <Card className="bg-slate-800 border-slate-700 p-6">
                        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full Name" required className="bg-slate-900 border border-slate-700 rounded-md px-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" type="email" required className="bg-slate-900 border border-slate-700 rounded-md px-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Password" type="password" required className="bg-slate-900 border border-slate-700 rounded-md px-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <input value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} placeholder="Employee ID (e.g. EMP-1001)" className="bg-slate-900 border border-slate-700 rounded-md px-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <input value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} placeholder="Designation" className="bg-slate-900 border border-slate-700 rounded-md px-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <select value={form.departmentId} onChange={e => setForm({ ...form, departmentId: e.target.value })} className="bg-slate-900 border border-slate-700 rounded-md px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Select Department</option>
                                {departments.map(d => <option key={d._id} value={d._id}>{d.departmentName}</option>)}
                            </select>
                            <div className="md:col-span-2">
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Create Employee</button>
                            </div>
                        </form>
                    </Card>
                )}

                <Card className="bg-slate-800 border-slate-700 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-300">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 border-b border-slate-700">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Employee ID</th>
                                    <th className="px-6 py-4">Designation</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-500"><div className="flex items-center justify-center gap-2"><div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />Loading...</div></td></tr>
                                ) : employees.length === 0 ? (
                                    <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-500">No employees found.</td></tr>
                                ) : (
                                    employees.map(emp => (
                                        <tr key={emp._id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-200">{emp.name}</td>
                                            <td className="px-6 py-4 text-slate-400">{emp.email}</td>
                                            <td className="px-6 py-4 text-slate-400">{emp.employeeId || '—'}</td>
                                            <td className="px-6 py-4 text-slate-400">{emp.designation || '—'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${emp.isActive ? 'text-green-400' : 'text-red-400'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${emp.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                                    {emp.status || (emp.isActive ? 'Active' : 'Inactive')}
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
