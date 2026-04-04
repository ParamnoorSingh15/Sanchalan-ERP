"use client";

import { useEffect } from 'react';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';
import { useTasks } from '@/hooks/useTasks';
import { Card } from '@/components/ui/card';
import TaskStatusBadge from '@/components/features/tasks/TaskStatusBadge';

export default function AdminTasksPage() {
    const { tasks, loading, fetchTasks, deleteTask } = useTasks();

    useEffect(() => { fetchTasks(); }, [fetchTasks]);

    return (
        <RoleProtectedRoute requiredRoles={['Admin']}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Global Task Registry</h1>
                    <p className="text-slate-400">Enterprise-wide oversight of all active and blocked operational workloads.</p>
                </div>

                <Card className="bg-slate-800 border-slate-700 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-300">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 border-b border-slate-700">
                                <tr>
                                    <th className="px-6 py-4">Task Info</th>
                                    <th className="px-6 py-4">Department</th>
                                    <th className="px-6 py-4">Assigned To</th>
                                    <th className="px-6 py-4">Status & Priority</th>
                                    <th className="px-6 py-4">Due Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="px-6 py-10 text-center"><div className="flex justify-center gap-2"><div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />Loading Database...</div></td></tr>
                                ) : tasks.length === 0 ? (
                                    <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500">No tasks exist in the system yet.</td></tr>
                                ) : (
                                    tasks.map(task => (
                                        <tr key={task._id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-200 line-clamp-1">{task.taskTitle}</div>
                                                <div className="text-xs text-slate-500 mt-1">ID: {task._id}</div>
                                            </td>
                                            <td className="px-6 py-4 font-medium">{task.departmentId?.departmentName || 'Global'}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-slate-300">{task.assignedTo?.name || 'Unassigned'}</div>
                                                <div className="text-xs text-slate-500">{task.assignedTo?.designation || ''}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <TaskStatusBadge status={task.status} priority={task.priority} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={new Date(task.dueDate) < new Date() && task.status !== 'Completed' ? 'text-red-400 font-semibold' : 'text-slate-400'}>
                                                    {new Date(task.dueDate).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => {
                                                    if (confirm('Are you sure? This soft-deletes the task affecting analytics.')) deleteTask(task._id);
                                                }} className="text-xs px-3 py-1 bg-red-900/30 text-red-400 hover:bg-red-800/80 rounded transition-colors font-medium border border-red-800/50">
                                                    Delete
                                                </button>
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
