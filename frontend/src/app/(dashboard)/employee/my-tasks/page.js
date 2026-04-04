"use client";

import { useEffect } from 'react';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';
import { useTasks } from '@/hooks/useTasks';
import TaskCard from '@/components/features/tasks/TaskCard';

export default function EmployeeTasksPage() {
    const { tasks, loading, fetchTasks, updateStatus } = useTasks();

    useEffect(() => { fetchTasks(); }, [fetchTasks]);

    const activeTasks = tasks.filter(t => t.status !== 'Completed' && t.status !== 'Cancelled');
    const completedTasks = tasks.filter(t => t.status === 'Completed');

    return (
        <RoleProtectedRoute requiredRoles={['Employee']}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">My Tasks</h1>
                    <p className="text-slate-400">View and update progress on your assigned tasks.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center p-10"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" /></div>
                ) : (
                    <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
                        {/* ACTIVE TASKS */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                Active Queue <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 ml-auto">{activeTasks.length}</span>
                            </h2>
                            <div className="flex flex-col gap-3">
                                {activeTasks.length === 0 ? (
                                    <p className="text-slate-500 text-sm p-4 bg-slate-900 border border-slate-800 rounded-lg text-center">No active tasks. You&apos;re all caught up!</p>
                                ) : (
                                    activeTasks.map(task => <TaskCard key={task._id} task={task} onStatusChange={updateStatus} />)
                                )}
                            </div>
                        </div>

                        {/* COMPLETED TASKS */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                Completed <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 ml-auto">{completedTasks.length}</span>
                            </h2>
                            <div className="flex flex-col gap-3 opacity-70">
                                {completedTasks.length === 0 ? (
                                    <p className="text-slate-500 text-sm p-4 bg-slate-900 border border-slate-800 rounded-lg text-center">No completed tasks yet.</p>
                                ) : (
                                    completedTasks.map(task => <TaskCard key={task._id} task={task} />)
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </RoleProtectedRoute>
    );
}
