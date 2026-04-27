import React from 'react';
import TaskStatusBadge from './TaskStatusBadge';

export default function TaskCard({ task, onStatusChange }) {
    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed';

    return (
        <div
            className={`p-4 rounded-lg border flex flex-col gap-3 shadow-sm ${
                isOverdue && task.priority === 'Critical'
                    ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-50 dark:bg-red-950/20'
                    : '' // no hover animation
            }`}
            style={{
                backgroundColor: isOverdue && task.priority === 'Critical' ? '' : 'var(--bg-surface)',
                borderColor: isOverdue && task.priority === 'Critical' ? '' : 'var(--border)'
            }}
        >
            <div className="flex justify-between items-start">
                <TaskStatusBadge status={task.status} priority={task.priority} />
                <span className={`text-[11px] font-semibold ${isOverdue ? 'text-red-500' : ''}`} style={{ color: !isOverdue ? 'var(--text-muted)' : undefined }}>
                    Due: {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
            </div>

            <div>
                <h4 className="text-sm font-semibold line-clamp-1" style={{ color: 'var(--text-primary)' }}>{task.taskTitle}</h4>
                <p className="text-xs mt-1 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{task.taskDescription || 'No description provided.'}</p>
            </div>

            <div className="flex items-center justify-between mt-auto pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                    <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border"
                        style={{ backgroundColor: 'var(--bg-surface-3)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
                    >
                        {task.assignedTo?.name ? task.assignedTo.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <span className="text-xs truncate max-w-[100px]" style={{ color: 'var(--text-muted)' }}>{task.assignedTo?.name || 'Unassigned'}</span>
                </div>

                {onStatusChange && (
                    <div className="flex gap-1">
                        {task.status !== 'In Progress' && task.status !== 'Completed' && task.assignedTo && (
                            <button
                                onClick={() => onStatusChange(task._id, 'start')}
                                className="text-[10px] px-2.5 py-1 rounded-md font-semibold"
                                style={{ backgroundColor: 'var(--bg-surface-3)', color: 'var(--color-info-fg)', border: '1px solid var(--border)' }}
                            >
                                Start
                            </button>
                        )}
                        {task.status === 'In Progress' && (
                            <>
                                <button
                                    onClick={() => onStatusChange(task._id, 'block', { reason: prompt('Block reason:') })}
                                    className="text-[10px] px-2.5 py-1 rounded-md font-semibold"
                                    style={{ backgroundColor: 'var(--color-danger-muted)', color: 'var(--color-danger-fg)', border: '1px solid var(--color-danger-border)' }}
                                >
                                    Block
                                </button>
                                <button
                                    onClick={() => onStatusChange(task._id, 'complete')}
                                    className="text-[10px] px-2.5 py-1 rounded-md font-semibold"
                                    style={{ backgroundColor: 'var(--color-success-muted)', color: 'var(--color-success-fg)', border: '1px solid var(--color-success-border)' }}
                                >
                                    Done
                                </button>
                            </>
                        )}
                        {task.status === 'Blocked' && (
                            <button
                                onClick={() => onStatusChange(task._id, 'start')}
                                className="text-[10px] px-2.5 py-1 rounded-md font-semibold"
                                style={{ backgroundColor: 'var(--bg-surface-3)', color: 'var(--color-info-fg)', border: '1px solid var(--border)' }}
                            >
                                Resume
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
