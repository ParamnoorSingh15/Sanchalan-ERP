'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import api from '@/lib/axios';

const panelVariants = {
    hidden:  { opacity: 0, scale: 0.97, y: 12 },
    visible: { opacity: 1, scale: 1,    y: 0,   transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
    exit:    { opacity: 0, scale: 0.97, y: 12,  transition: { duration: 0.15 } },
};

export default memo(function AdminAssignTaskModal({ isOpen, onClose, onTaskCreated }) {
    const [title,        setTitle]        = useState('');
    const [desc,         setDesc]         = useState('');
    const [dueDate,      setDueDate]      = useState('');
    const [priority,     setPriority]     = useState('Medium');
    const [assigneeId,   setAssigneeId]   = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [estimatedHrs, setEstimatedHrs] = useState('');
    const [users,        setUsers]        = useState([]);
    const [departments,  setDepartments]  = useState([]);
    const [loading,      setLoading]      = useState(false);
    const [fetching,     setFetching]     = useState(false);
    const [error,        setError]        = useState('');

    useEffect(() => {
        if (!isOpen) return;
        setFetching(true);
        setError('');
        Promise.all([
            api.get('/users'),
            api.get('/departments'),
        ]).then(([usersRes, deptsRes]) => {
            setUsers(usersRes.data.data || usersRes.data || []);
            setDepartments(deptsRes.data.data || deptsRes.data || []);
        }).catch(() => {
            setError('Failed to load users or departments. Please try again.');
        }).finally(() => setFetching(false));
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            setTitle(''); setDesc(''); setDueDate(''); setPriority('Medium');
            setAssigneeId(''); setDepartmentId(''); setEstimatedHrs(''); setError('');
        }
    }, [isOpen]);

    const handleAssigneeChange = useCallback((e) => {
        const uid = e.target.value;
        setAssigneeId(uid);
        if (uid) {
            const selectedUser = users.find(u => u._id === uid);
            if (selectedUser?.departmentId) {
                const deptId = typeof selectedUser.departmentId === 'object'
                    ? selectedUser.departmentId._id
                    : selectedUser.departmentId;
                if (!departmentId) setDepartmentId(deptId);
            }
        }
    }, [users, departmentId]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!departmentId) { setError('Please select a department.'); return; }
        setLoading(true);
        setError('');
        try {
            await api.post('/tasks/create', {
                taskTitle:        title,
                taskDescription:  desc,
                dueDate,
                priority,
                estimatedHours:   estimatedHrs ? Number(estimatedHrs) : undefined,
                assignedTo:       assigneeId   || undefined,
                departmentId,
            });
            onTaskCreated();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create task. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [title, desc, dueDate, priority, estimatedHrs, assigneeId, departmentId, onTaskCreated, onClose]);

    // FILTER LOGIC
    const activeUsers = users.filter(u => u.isActive);
    
    const usersInDept = departmentId 
        ? activeUsers.filter(u => {
              const uDept = typeof u.departmentId === 'object' ? u.departmentId?._id : u.departmentId;
              return uDept === departmentId;
          })
        : activeUsers;

    const managers = usersInDept.filter(u => u.roles?.includes('Manager') || u.roles?.includes('Admin'));
    const employees = usersInDept.filter(u => !u.roles?.includes('Manager') && !u.roles?.includes('Admin'));

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="overlay"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={(e) => e.target === e.currentTarget && onClose()}
                >
                    <motion.div
                        key="panel"
                        variants={panelVariants}
                        initial="hidden" animate="visible" exit="exit"
                        className="rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border"
                        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ backgroundColor: 'var(--bg-surface-3)', borderColor: 'var(--border)' }}>
                            <div>
                                <h2 className="text-lg font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Assign New Task</h2>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                    Admin — organization-wide assignment
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="rounded-lg p-1.5 transition-all duration-150"
                                style={{ color: 'var(--text-muted)', backgroundColor: 'transparent' }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto" data-lenis-prevent="true">
                            {/* Error */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                        className="p-3 text-sm rounded-lg flex items-center gap-2"
                                        style={{ backgroundColor: 'var(--color-danger-muted)', color: 'var(--color-danger-fg)', border: '1px solid var(--color-danger-border)' }}
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {fetching && (
                                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                                    <Loader2 size={14} className="animate-spin" />
                                    Loading organization data…
                                </div>
                            )}

                            {/* Task Title */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                                    Task Title <span className="text-red-400">*</span>
                                </label>
                                <input
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                    placeholder="E.g., Quarterly Financial Audit"
                                    className="w-full rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 transition-all border"
                                    style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Description</label>
                                <textarea
                                    value={desc}
                                    onChange={e => setDesc(e.target.value)}
                                    rows={3}
                                    placeholder="Detailed task instructions and scope..."
                                    className="w-full rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 transition-all resize-none border"
                                    style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                />
                            </div>

                            {/* Due Date + Priority + Est. Hours */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                                        Due Date <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={e => setDueDate(e.target.value)}
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 transition-all border [color-scheme:light_dark]"
                                        style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Priority</label>
                                    <select
                                        value={priority}
                                        onChange={e => setPriority(e.target.value)}
                                        className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 transition-all border"
                                        style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                    >
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                        <option>Critical</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Est. Hours</label>
                                    <input
                                        type="number"
                                        value={estimatedHrs}
                                        onChange={e => setEstimatedHrs(e.target.value)}
                                        placeholder="e.g., 8"
                                        min="0.5"
                                        step="0.5"
                                        className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 transition-all border"
                                        style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                    />
                                </div>
                            </div>

                            {/* CASCADING FLOW: Department -> User */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div className="space-y-1.5 border p-3 rounded-xl" style={{ borderColor: 'var(--color-info-border)', backgroundColor: 'var(--color-info-muted)' }}>
                                    <label className="block text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-info-fg)' }}>
                                        1. Select Department <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        value={departmentId}
                                        onChange={e => {
                                            setDepartmentId(e.target.value);
                                            setAssigneeId('');
                                        }}
                                        required
                                        className="w-full rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 transition-all border"
                                        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                    >
                                        <option value="">-- Choose Department --</option>
                                        {departments.map(dept => (
                                            <option key={dept._id} value={dept._id}>
                                                {dept.departmentName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5 border p-3 rounded-xl" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface-3)' }}>
                                    <label className="block text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                                        2. Assign Person <span className="font-normal normal-case" style={{ color: 'var(--text-muted)' }}>(optional)</span>
                                    </label>
                                    <select
                                        value={assigneeId}
                                        onChange={handleAssigneeChange}
                                        disabled={!departmentId && departments.length > 0} 
                                        className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed border"
                                        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                    >
                                        <option value="">Pending / Open</option>
                                        
                                        {managers.length > 0 && (
                                            <optgroup label="Managers">
                                                {managers.map(u => (
                                                    <option key={u._id} value={u._id}>
                                                        {u.name} — {u.designation || 'Manager'}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        )}

                                        {employees.length > 0 && (
                                            <optgroup label="Employees">
                                                {employees.map(u => (
                                                    <option key={u._id} value={u._id}>
                                                        {u.name} — {u.designation || 'Employee'}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        )}
                                        
                                        {managers.length === 0 && employees.length === 0 && departmentId && (
                                            <option value="" disabled>No personnel available</option>
                                        )}
                                    </select>
                                </div>
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t" style={{ backgroundColor: 'var(--bg-surface-3)', borderColor: 'var(--border)' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border"
                                style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-surface)'}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading || fetching}
                                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 shadow-md shadow-blue-900/30 transition-all duration-200"
                            >
                                {loading ? (
                                    <><Loader2 size={14} className="animate-spin" /> Assigning…</>
                                ) : '+ Assign Task'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
});
