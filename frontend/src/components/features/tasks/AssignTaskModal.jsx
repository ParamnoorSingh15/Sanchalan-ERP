import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl w-full max-w-lg">
                <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white tracking-tight">Assign New Task</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Task Title <span className="text-red-500">*</span></label>
                        <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="E.g., Update Database Schema" className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors" />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Description</label>
                        <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="Detailed instructions..." className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Due Date <span className="text-red-500">*</span></label>
                            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-white outline-none focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Priority</label>
                            <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-white outline-none focus:border-blue-500">
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                                <option>Critical</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Assign To (Optional)</label>
                        <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-white outline-none focus:border-blue-500">
                            <option value="">Leave unassigned (Pending)</option>
                            {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name} ({emp.designation || 'Employee'})</option>)}
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="px-5 py-2 rounded-md text-sm font-bold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition-colors">
                            {loading ? 'Assigning...' : 'Assign Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
