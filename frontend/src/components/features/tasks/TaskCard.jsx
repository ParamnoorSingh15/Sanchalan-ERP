import React from 'react';
import TaskStatusBadge from './TaskStatusBadge';

export default function TaskCard({ task, onStatusChange }) {
    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed';

    return (
        <div className={`p-4 rounded-lg bg-slate-800 border flex flex-col gap-3 transition-colors ${isOverdue && task.priority === 'Critical' ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-950/20' : 'border-slate-700 hover:border-slate-600'}`}>
            <div className="flex justify-between items-start">
                <TaskStatusBadge status={task.status} priority={task.priority} />
                <span className={`text-xs font-medium ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
                    Due: {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
            </div>

            <div>
                <h4 className="text-sm font-semibold text-white line-clamp-1">{task.taskTitle}</h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{task.taskDescription || 'No description provided.'}</p>
            </div>

            <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-700/50">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-slate-300 font-bold border border-slate-600">
                        {task.assignedTo?.name ? task.assignedTo.name.charAt(0) : '?'}
                    </div>
                    <span className="text-xs text-slate-400 truncate max-w-[100px]">{task.assignedTo?.name || 'Unassigned'}</span>
                </div>

                {onStatusChange && (
                    <div className="flex gap-1">
                        {task.status !== 'In Progress' && task.status !== 'Completed' && task.assignedTo && (
                            <button onClick={() => onStatusChange(task._id, 'start')} className="text-[10px] px-2 py-1 bg-blue-900/50 text-blue-400 hover:bg-blue-800 rounded transition-colors">Start</button>
                        )}
                        {task.status === 'In Progress' && (
                            <>
                                <button onClick={() => onStatusChange(task._id, 'block', { reason: prompt('Block reason:') })} className="text-[10px] px-2 py-1 bg-red-900/50 text-red-400 hover:bg-red-800 rounded transition-colors">Block</button>
                                <button onClick={() => onStatusChange(task._id, 'complete')} className="text-[10px] px-2 py-1 bg-green-900/50 text-green-400 hover:bg-green-800 rounded transition-colors">Done</button>
                            </>
                        )}
                        {task.status === 'Blocked' && (
                            <button onClick={() => onStatusChange(task._id, 'start')} className="text-[10px] px-2 py-1 bg-blue-900/50 text-blue-400 hover:bg-blue-800 rounded transition-colors">Resume</button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
