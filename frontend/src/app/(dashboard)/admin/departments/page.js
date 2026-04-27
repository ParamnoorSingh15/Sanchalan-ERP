"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/axios';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';

export default function AdminDepartmentsPage() {
    const [departments, setDepartments] = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [showForm,   setShowForm]   = useState(false);
    const [form,       setForm]       = useState({ departmentName: '', description: '' });

    const fetchDepts = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/departments');
            setDepartments(data.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchDepts(); }, [fetchDepts]);

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
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
                            Departments
                        </h1>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                            Manage organizational departments and their structures.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowForm(v => !v)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-900/20 transition-all duration-200 interactive shrink-0"
                    >
                        {showForm ? <X size={15} /> : <Plus size={15} />}
                        {showForm ? 'Cancel' : 'New Department'}
                    </button>
                </div>

                {/* Create form */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                        >
                            <div className="rounded-xl p-6 border transition-colors duration-300"
                                 style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                                <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                                    Create a New Department
                                </h3>
                                <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        value={form.departmentName}
                                        onChange={e => setForm({ ...form, departmentName: e.target.value })}
                                        placeholder="Department Name *"
                                        required
                                        className="flex-1 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                    />
                                    <input
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                        placeholder="Description (optional)"
                                        className="flex-1 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                    />
                                    <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 shrink-0">
                                        Create
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Table */}
                <div className="rounded-xl shadow-sm overflow-hidden card-hover border transition-colors duration-300"
                     style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase"
                               style={{ backgroundColor: 'var(--bg-surface-3)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                            <tr>
                                <th className="px-6 py-3.5 font-semibold tracking-wide">Department</th>
                                <th className="px-6 py-3.5 font-semibold tracking-wide">Description</th>
                                <th className="px-6 py-3.5 font-semibold tracking-wide">Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i} className="border-b" style={{ borderColor: 'var(--border)' }}>
                                        {[60, 40, 25].map((w, j) => (
                                            <td key={j} className="px-6 py-4">
                                                <div className="h-3.5 rounded animate-pulse" style={{ width: `${w}%`, backgroundColor: 'var(--bg-surface-3)' }} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : departments.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                                        No departments found. Create one above.
                                    </td>
                                </tr>
                            ) : (
                                departments.map(d => (
                                    <tr key={d._id}
                                        className="border-b transition-colors duration-150"
                                        style={{ borderColor: 'var(--border)' }}
                                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; }}>
                                        <td className="px-6 py-3.5 font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                                            {d.departmentName}
                                        </td>
                                        <td className="px-6 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                                            {d.description || '—'}
                                        </td>
                                        <td className="px-6 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                                            {new Date(d.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </RoleProtectedRoute>
    );
}
