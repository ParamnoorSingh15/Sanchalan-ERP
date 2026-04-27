"use client";

import { useEffect, useState } from 'react';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';
import { useTasks } from '@/hooks/useTasks';
import TaskCard from '@/components/features/tasks/TaskCard';
import AssignTaskModal from '@/components/features/tasks/AssignTaskModal';

export default function ManagerTasksPage() {
    const { tasks, loading, fetchTasks, updateStatus } = useTasks();

    const handleStatusChange = async (taskId, action, payload = {}) => {
        try {
            await updateStatus(taskId, action, payload);
        } catch (err) {
            console.error('[Manager] status change failed:', err);
        }
    };
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);

    // Simple Kanban Grouping
    const unassigned = tasks.filter(t => t.status === 'Pending');
    const active = tasks.filter(t => ['Assigned', 'In Progress'].includes(t.status));
    const blocked = tasks.filter(t => t.status === 'Blocked');
    const done = tasks.filter(t => t.status === 'Completed');

    const Column = ({ title, color, items }) => (
        <div
            className="flex flex-col rounded-xl h-full"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
            <div
                className="px-4 py-3 flex justify-between items-center rounded-t-xl"
                style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface-2)' }}
            >
                <h3 className="font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <span className={`w-2 h-2 rounded-full ${color}`} />
                    {title}
                </h3>
                <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--bg-surface-3)', color: 'var(--text-muted)' }}
                >
                    {items.length}
                </span>
            </div>
            <div className="p-3 flex-1 overflow-y-auto min-h-[400px] flex flex-col gap-3" data-lenis-prevent="true">
                {items.length === 0 ? (
                    <p className="text-xs italic text-center py-6 rounded-lg" style={{ color: 'var(--text-muted)', border: '1px dashed var(--border)' }}>Empty list</p>
                ) : (
                    items.map(t => <TaskCard key={t._id} task={t} onStatusChange={handleStatusChange} />)
                )}
            </div>
        </div>
    );

    return (
        <RoleProtectedRoute requiredRoles={['Manager']}>
            <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
                <div className="flex justify-between items-center shrink-0">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>Team Tasks Workbench</h1>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Oversee department workflow and dispatch tasks.</p>
                    </div>
                    <button onClick={() => setAssignModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20">
                        + Assign Task
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center p-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 flex-1 pb-4">
                        <Column title="Backlog / Pending" color="bg-slate-500" items={unassigned} />
                        <Column title="Active Work" color="bg-blue-500" items={active} />
                        <Column title="Blocked" color="bg-red-500" items={blocked} />
                        <Column title="Completed" color="bg-green-500" items={done} />
                    </div>
                )}
            </div>

            <AssignTaskModal
                isOpen={isAssignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                onTaskCreated={fetchTasks}
            />
        </RoleProtectedRoute>
    );
}
