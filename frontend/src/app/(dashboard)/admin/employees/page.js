"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';

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
                        <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>Employee Management</h1>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Create and manage employee accounts.</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                        {showForm ? 'Cancel' : '+ New Employee'}
                    </button>
                </div>

                {showForm && (
                    <div className="rounded-xl border p-6 shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { key: 'name', placeholder: 'Full Name', type: 'text', required: true },
                                { key: 'email', placeholder: 'Email', type: 'email', required: true },
                                { key: 'password', placeholder: 'Password', type: 'password', required: true },
                                { key: 'employeeId', placeholder: 'Employee ID (e.g. EMP-1001)', type: 'text' },
                                { key: 'designation', placeholder: 'Designation', type: 'text' },
                            ].map(({ key, placeholder, type, required }) => (
                                <input
                                    key={key}
                                    value={form[key]}
                                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                                    placeholder={placeholder}
                                    type={type}
                                    required={required}
                                    className="rounded-md px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{
                                        backgroundColor: 'var(--bg-surface-3)',
                                        border: '1px solid var(--border)',
                                        color: 'var(--text-primary)',
                                    }}
                                />
                            ))}
                            <select
                                value={form.departmentId}
                                onChange={e => setForm({ ...form, departmentId: e.target.value })}
                                className="rounded-md px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                style={{
                                    backgroundColor: 'var(--bg-surface-3)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text-primary)',
                                }}
                            >
                                <option value="">Select Department</option>
                                {departments.map(d => <option key={d._id} value={d._id}>{d.departmentName}</option>)}
                            </select>
                            <div className="md:col-span-2">
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Create Employee</button>
                            </div>
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
                                style={{
                                    backgroundColor: 'var(--bg-surface-3)',
                                    borderBottom: '1px solid var(--border)',
                                    color: 'var(--text-secondary)',
                                }}
                            >
                                <tr>
                                    <th className="px-6 py-3.5 font-semibold tracking-wide">Name</th>
                                    <th className="px-6 py-3.5 font-semibold tracking-wide">Email</th>
                                    <th className="px-6 py-3.5 font-semibold tracking-wide">Employee ID</th>
                                    <th className="px-6 py-3.5 font-semibold tracking-wide">Designation</th>
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
                                ) : employees.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                                            No employees found.
                                        </td>
                                    </tr>
                                ) : (
                                    employees.map(emp => (
                                        <tr
                                            key={emp._id}
                                            className="border-b transition-colors duration-150"
                                            style={{ borderColor: 'var(--border)' }}
                                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; }}
                                        >
                                            <td className="px-6 py-3.5 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{emp.name}</td>
                                            <td className="px-6 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>{emp.email}</td>
                                            <td className="px-6 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>{emp.employeeId || '—'}</td>
                                            <td className="px-6 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>{emp.designation || '—'}</td>
                                            <td className="px-6 py-3.5">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-full tracking-wide shadow-sm ${emp.isActive ? 'badge-success' : 'badge-muted'}`}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0" />
                                                    {emp.status || (emp.isActive ? 'Active' : 'Inactive')}
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
