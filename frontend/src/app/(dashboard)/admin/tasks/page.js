"use client";

import { useEffect, useState, useCallback, memo } from 'react';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';
import { useTasks } from '@/hooks/useTasks';
import TaskStatusBadge from '@/components/features/tasks/TaskStatusBadge';
import AdminAssignTaskModal from '@/components/features/tasks/AdminAssignTaskModal';

/* ── Overdue indicator ─────────────────────────────── */
function DueDateCell({ dueDate, status }) {
    const isOverdue = new Date(dueDate) < new Date() && status !== 'Completed' && status !== 'Cancelled';
    return (
        <span className={isOverdue ? 'font-semibold' : ''}
              style={{ color: isOverdue ? 'var(--color-danger-fg)' : 'var(--text-muted)' }}>
            {new Date(dueDate).toLocaleDateString()}
            {isOverdue && <span className="ml-1.5 text-[10px] badge-danger px-1.5 py-0.5 rounded-full">Overdue</span>}
        </span>
    );
}

/* Memoised table row ──────────────────────────────── */
const TaskRow = memo(function TaskRow({ task, onDelete }) {
    return (
        <tr
            className="border-b transition-colors duration-150 group"
            style={{ borderColor: 'var(--border)' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; }}
        >
            <td className="px-6 py-3.5">
                <div className="font-semibold text-sm leading-tight line-clamp-1" style={{ color: 'var(--text-primary)' }}>{task.taskTitle}</div>
                <div className="text-[11px] mt-0.5 font-mono" style={{ color: 'var(--text-muted)' }}>
                    {task._id.slice(-8)}
                </div>
            </td>
            <td className="px-6 py-3.5 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {task.departmentId?.departmentName || 'Global'}
            </td>
            <td className="px-6 py-3.5">
                {task.assignedTo ? (
                    <div>
                        <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{task.assignedTo.name}</div>
                        <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                            {task.assignedTo.designation || task.assignedTo.email}
                        </div>
                    </div>
                ) : (
                    <span className="badge-muted text-[11px] px-2 py-0.5 rounded-full font-medium">Unassigned</span>
                )}
            </td>
            <td className="px-6 py-3.5">
                <TaskStatusBadge status={task.status} priority={task.priority} />
            </td>
            <td className="px-6 py-3.5">
                <DueDateCell dueDate={task.dueDate} status={task.status} />
            </td>
            <td className="px-6 py-3.5 text-right">
                <button
                    onClick={() => onDelete(task._id)}
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-[11px] px-3 py-1.5 badge-danger rounded-lg transition-all duration-150 font-semibold"
                >
                    Delete
                </button>
            </td>
        </tr>
    );
});

export default function AdminTasksPage() {
    const { tasks, loading, fetchTasks, deleteTask } = useTasks();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);

    const handleDelete = useCallback((id) => {
        if (confirm('Delete this task? This action permanently removes it from analytics.')) {
            deleteTask(id);
        }
    }, [deleteTask]);

    const handleTaskCreated = useCallback(() => {
        fetchTasks();
    }, [fetchTasks]);

    // Summary stats
    const stats = {
        total:     tasks.length,
        active:    tasks.filter(t => ['Assigned', 'In Progress'].includes(t.status)).length,
        overdue:   tasks.filter(t => new Date(t.dueDate) < new Date() && !['Completed', 'Cancelled'].includes(t.status)).length,
        completed: tasks.filter(t => t.status === 'Completed').length,
    };

    return (
        <RoleProtectedRoute requiredRoles={['Admin']}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>Global Task Registry</h1>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                            Organization-wide oversight of all tasks. Assign, delete, and monitor workloads.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-900/30 transition-all duration-200 interactive shrink-0"
                    >
                        + Assign Task
                    </button>
                </div>

                {/* Stats Row */}
                {!loading && tasks.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Tasks',  value: stats.total,     cls: 'badge-muted'    },
                            { label: 'Active',        value: stats.active,    cls: 'badge-info'     },
                            { label: 'Overdue',       value: stats.overdue,   cls: 'badge-danger'   },
                            { label: 'Completed',     value: stats.completed, cls: 'badge-success'  },
                        ].map(({ label, value, cls }) => (
                            <div key={label} className={`${cls} flex items-center justify-between px-4 py-3 rounded-xl shadow-sm`}>
                                <span className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</span>
                                <span className="text-xl font-bold">{value}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Table */}
                <div
                    className="rounded-xl shadow-sm overflow-hidden card-hover border transition-colors duration-300"
                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                >
                    <div className="overflow-x-auto" data-lenis-prevent="true">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase sticky top-0 z-10"
                                   style={{ backgroundColor: 'var(--bg-surface-3)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                                <tr>
                                    <th className="px-6 py-3.5 font-semibold tracking-wide">Task</th>
                                    <th className="px-6 py-3.5 font-semibold tracking-wide">Department</th>
                                    <th className="px-6 py-3.5 font-semibold tracking-wide">Assigned To</th>
                                    <th className="px-6 py-3.5 font-semibold tracking-wide">Status / Priority</th>
                                    <th className="px-6 py-3.5 font-semibold tracking-wide">Due</th>
                                    <th className="px-6 py-3.5 text-right font-semibold tracking-wide">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 7 }).map((_, i) => (
                                        <tr key={i} className="border-b" style={{ borderColor: 'var(--border)' }}>
                                            {Array.from({ length: 6 }).map((_, j) => (
                                                <td key={j} className="px-6 py-4">
                                                    <div className="h-3.5 rounded animate-pulse"
                                                         style={{ width: `${50 + j * 7}%`, backgroundColor: 'var(--bg-surface-3)' }} />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : tasks.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-14 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                                            No tasks found. Click <strong>+ Assign Task</strong> to create the first one.
                                        </td>
                                    </tr>
                                ) : (
                                    tasks.map(task => (
                                        <TaskRow key={task._id} task={task} onDelete={handleDelete} />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <AdminAssignTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onTaskCreated={handleTaskCreated}
            />
        </RoleProtectedRoute>
    );
}
