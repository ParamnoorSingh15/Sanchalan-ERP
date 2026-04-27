import React from 'react';

export default function TaskStatusBadge({ status, priority }) {
    const getStatusColor = (s) => {
        switch (s) {
            case 'Completed': return 'badge-success';
            case 'In Progress': return 'badge-info';
            case 'Blocked': return 'badge-danger';
            case 'Assigned': return 'badge-warning';
            case 'Pending': default: return 'badge-muted';
            case 'Cancelled': return 'badge-muted opacity-60 line-through';
        }
    };

    const getPriorityColor = (p) => {
        switch (p) {
            case 'Critical': return 'bg-red-500 text-white';
            case 'High': return 'bg-orange-500 text-white';
            case 'Medium': return 'bg-blue-500 text-white';
            case 'Low': default: return 'bg-slate-500 text-white';
        }
    };

    return (
        <div className="flex gap-2 flex-wrap items-center">
            {priority && (
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${getPriorityColor(priority)}`}>
                    {priority}
                </span>
            )}
            {status && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
                    {status}
                </span>
            )}
        </div>
    );
}
