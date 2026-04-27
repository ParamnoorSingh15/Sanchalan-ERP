import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { X, Loader2 } from 'lucide-react';

export default function AssignTaskModal({ isOpen, onClose, onTaskCreated }) {
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [assigneeId, setAssigneeId] = useState('');
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            api.get('/employees').then(res => setEmployees(res.data.data)).catch(console.error);
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/tasks/create', {
                taskTitle: title,
                taskDescription: desc,
                dueDate,
                priority,
                assignedTo: assigneeId || undefined
            });
            onTaskCreated();
            onClose();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to assign task');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // Group employees by role
    const managers = employees.filter(emp => emp.roles?.includes('Manager'));
    const staff = employees.filter(emp => !emp.roles?.includes('Manager'));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                <div className="px-6 py-4 border-b flex justify-between items-center" style={{ backgroundColor: 'var(--bg-surface-3)', borderColor: 'var(--border)' }}>
                    <h2 className="text-lg font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Assign New Task</h2>
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
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Task Title <span className="text-red-400">*</span></label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                            placeholder="E.g., Update Database Schema"
                            className="w-full rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 transition-all border"
                            style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Description</label>
                        <textarea
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            rows={3}
                            placeholder="Detailed instructions..."
                            className="w-full rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 transition-all resize-none border"
                            style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Due Date <span className="text-red-400">*</span></label>
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
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Priority</label>
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
                    </div>
                    
                    <div className="border p-3 rounded-xl mt-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface-3)' }}>
                        <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                            Assign Person <span className="font-normal normal-case" style={{ color: 'var(--text-muted)' }}>(optional)</span>
                        </label>
                        <select
                            value={assigneeId}
                            onChange={e => setAssigneeId(e.target.value)}
                            className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-all border"
                            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                        >
                            <option value="">Leave unassigned (Pending)</option>
                            
                            {managers.length > 0 && (
                                <optgroup label="Managers / Leaders">
                                    {managers.map(emp => <option key={emp._id} value={emp._id}>{emp.name} ({emp.designation || 'Manager'})</option>)}
                                </optgroup>
                            )}

                            {staff.length > 0 && (
                                <optgroup label="Team Members">
                                    {staff.map(emp => <option key={emp._id} value={emp._id}>{emp.name} ({emp.designation || 'Employee'})</option>)}
                                </optgroup>
                            )}
                        </select>
                        <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-muted)' }}>This list only shows employees in your designated department.</p>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
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
                        <button type="submit" disabled={loading} className="px-5 py-2 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 shadow-md shadow-blue-900/30 transition-all duration-200">
                            {loading ? (
                                <><Loader2 size={14} className="animate-spin inline mr-1.5" /> Assigning…</>
                            ) : '+ Assign Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
